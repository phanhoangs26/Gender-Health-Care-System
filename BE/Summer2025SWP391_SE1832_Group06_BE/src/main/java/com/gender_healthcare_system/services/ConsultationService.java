package com.gender_healthcare_system.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gender_healthcare_system.dtos.todo.ConsultationDTO;
import com.gender_healthcare_system.dtos.todo.ConsultantScheduleDTO;
import com.gender_healthcare_system.dtos.todo.ConsultationTypeDTO;
import com.gender_healthcare_system.entities.enu.*;
import com.gender_healthcare_system.entities.todo.Consultation;
import com.gender_healthcare_system.entities.todo.ConsultationPayment;
import com.gender_healthcare_system.entities.todo.ConsultationType;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.ConsultationCompletePayload;
import com.gender_healthcare_system.payloads.todo.ConsultationConfirmPayload;
import com.gender_healthcare_system.payloads.todo.EvaluatePayload;
import com.gender_healthcare_system.payloads.todo.ConsultationRegisterPayload;
import com.gender_healthcare_system.repositories.AccountRepo;
import com.gender_healthcare_system.repositories.ConsultationPaymentRepo;
import com.gender_healthcare_system.repositories.ConsultationRepo;
import com.gender_healthcare_system.repositories.ConsultationTypeRepo;
import com.gender_healthcare_system.utils.UtilFunctions;
import lombok.AllArgsConstructor;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import com.gender_healthcare_system.entities.enu.AccountStatus;


@Service
@AllArgsConstructor
public class ConsultationService {

    private final AccountRepo accountRepo;
    private final ConsultationRepo consultationRepo;
    private final ConsultationTypeRepo consultationTypeRepo;
    private final ConsultationPaymentRepo consultationPaymentRepo;

    //getConsultationById
    public ConsultationDTO getConsultationById(int id)
            throws JsonProcessingException {

        return consultationRepo
                .getConsultationDetailsById(id)
                .orElseThrow(() -> new AppException(404, "Consultation not found"));
    }

    public ConsultationDTO getConsultationByIdForCustomer(int id) {

        return consultationRepo
                .getConsultationDetailsByIdForCustomer(id)
                .orElseThrow(() -> new AppException(404, "Consultation not found"));
    }

    public List<ConsultationTypeDTO> getAllConsultationTypesForCustomerByGender
            (GenderType gender){
        List<ConsultationTypeDTO> consultationTypes = consultationTypeRepo
                .getAllConsultationTypesForCustomerByGender(gender);

        if(consultationTypes.isEmpty()){

            throw new AppException(404, "No Consultation Type found for gender "
                    + gender.getType());
        }

        return consultationTypes;
    }

    //getConsultationByCustomerId
    public Map<String, Object> getConsultationsByCustomerId
    (int customerId, int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if(sortOrder.equals("desc")){
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);


        Page<ConsultationDTO> pageResult =
                consultationRepo.findByCustomerId(customerId, pageRequest);

        if(!pageResult.hasContent()){

            throw new AppException(404, "No Consultations found");
        }

        List<ConsultationDTO> consultationList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();

        map.put("totalItems", pageResult.getTotalElements());
        map.put("consultations", consultationList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    //getConsultationByConsultantId
    public Map<String, Object> getConsultationsByConsultantId
    (int consultantId, int page, String sortField, String sortOrder) {

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);

        if(sortOrder.equals("desc")){
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageRequest = PageRequest
                .of(page, itemSize, sort);


        Page<ConsultationDTO> pageResult =
                consultationRepo.findByConsultantId(consultantId, pageRequest);

        if(!pageResult.hasContent()){

            throw new AppException(404, "No Consultations found");
        }

        List<ConsultationDTO> consultationList = pageResult.getContent();

        Map<String, Object> map = new HashMap<>();
        map.put("totalItems", pageResult.getTotalElements());
        map.put("consultations", consultationList);
        map.put("totalPages", pageResult.getTotalPages());
        map.put("currentPage", pageResult.getNumber());

        return map;
    }

    public ConsultantScheduleDTO getConsultantScheduleByDate
            (int consultantId, LocalDate date) {

        boolean consultantExist = accountRepo.existsByAccountIdAndRole_RoleNameAndStatus(consultantId, "CONSULTANT", AccountStatus.ACTIVE);

        if(!consultantExist){

            throw new AppException(404, "Consultant not found with ID "+ consultantId);
        }

        List<LocalDateTime> consultationList = consultationRepo
                        .getConsultantScheduleByDate(consultantId, date);

        return new ConsultantScheduleDTO(consultantId, consultationList);
    }

    @Transactional(rollbackFor = Exception.class)
    public void registerConsultation(ConsultationRegisterPayload payload) {

        UtilFunctions.validateExpectedStartTime(payload.getExpectedStartTime());

        UtilFunctions.validatePaymentInput(payload.getPayment().getMethod(),
                payload.getPayment().getTransactionId());

        boolean consultationExist = consultationRepo
                .existsConsultationByConsultantAccountIdAndExpectedStartTimeAndStatusNot
                        (payload.getConsultantId(),
                                payload.getExpectedStartTime(), ConsultationStatus.CANCELLED);

        if(consultationExist){

            throw new AppException(409, "Consultation has already been booked");
        }

        ConsultationType consultationType = consultationTypeRepo
                .findById(payload.getConsultationTypeId())
                .orElseThrow(() -> new AppException(404,
                        "No Consultation type found with ID " + payload.getConsultationTypeId()));

        Account customer = accountRepo.findById(payload.getCustomerId())
                .orElseThrow(() -> new AppException(404,
                        "Customer not found with ID " + payload.getCustomerId()));

        String consultationTypeTargetGender = consultationType.getTargetGender().getType();
        String customerGender = customer.getGender().getGender();

        if(!consultationTypeTargetGender.equals("ANY")
        && !customerGender.equals(consultationTypeTargetGender)){

            throw new AppException(400, "Customer with gender "+ customerGender +
                    " cannot book Consultation Type with target gender of "+
                    consultationTypeTargetGender);
        }

        Account consultant = accountRepo.findById(payload.getConsultantId())
                .orElseThrow(() -> new AppException(404,
                        "Consultant not found with ID "+ payload.getConsultantId()));

        Consultation consultation = new Consultation();

        consultation.setCreatedAt(UtilFunctions.getCurrentDateTimeWithTimeZone());
        consultation.setExpectedStartTime(payload.getExpectedStartTime());
        LocalDateTime expectedEndTime = payload.getExpectedStartTime().plusHours(1);
        consultation.setExpectedEndTime(expectedEndTime);
        consultation.setConsultationType(consultationType);
        consultation.setStatus(ConsultationStatus.CONFIRMED);
        consultation.setCustomer(customer);
        consultation.setConsultant(consultant);

        consultationRepo.saveAndFlush(consultation);

        ConsultationPayment consultationPayment = new ConsultationPayment();

        consultationPayment.setConsultation(consultation);

        if(payload.getPayment().getMethod() == PaymentMethod.CASH){

            String transactionId = UtilFunctions.generateTransactionId();
            consultationPayment.setTransactionId(transactionId);
        }

        if(payload.getPayment().getMethod() == PaymentMethod.BANKING){

        consultationPayment.setTransactionId(payload.getPayment().getTransactionId());
        }

        consultationPayment.setAmount(payload.getPayment().getAmount());
        consultationPayment.setMethod(payload.getPayment().getMethod());
        consultationPayment.setDescription(payload.getPayment().getDescription());

        LocalDateTime createdAt = UtilFunctions.convertTimeStampToLocalDateTime
                (payload.getPayment().getCreatedAtTimeStamp());
        consultationPayment.setCreatedAt(createdAt);
        consultationPayment.setStatus(PaymentStatus.PAID);

        consultationPaymentRepo.saveAndFlush(consultationPayment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelConsultation(int id) {
        boolean consultationExist = consultationRepo.existsById(id);

        if(!consultationExist){

            throw new AppException(404, "Consultation not found");
        }

        consultationRepo.cancelConsultation(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reScheduleConsultation(int consultationId, ConsultationConfirmPayload payload) {

        UtilFunctions.validateRescheduleExpectedStartTime(payload.getExpectedStartTime());

        Consultation consultation = consultationRepo
                .findConsultationById(consultationId)
                .orElseThrow(() -> new AppException(404, "Consultation not found"));

        if (consultation.getStatus() == ConsultationStatus.COMPLETED
                || consultation.getStatus() == ConsultationStatus.CANCELLED) {

            throw new AppException
                    (400, "Cannot reschedule a completed or cancelled consultation");
        }

        boolean consultationTimeConflict = consultationRepo
                .existsConsultationByConsultantAccountIdAndExpectedStartTimeAndStatusNot
                        (payload.getConsultantId(), payload.getExpectedStartTime(),
                                ConsultationStatus.CANCELLED);

        if(consultationTimeConflict){

            throw new AppException(409, "Consultation time conflict");
        }

        LocalDateTime expectedEndTime = payload.getExpectedStartTime().plusHours(1);

        consultationRepo.updateConsultation
                (consultationId, payload, expectedEndTime, ConsultationStatus.RESCHEDULED);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateConsultationCommentAndRating
            (int id, EvaluatePayload payload) {
        boolean consultationExist = consultationRepo.existsById(id);

        if(!consultationExist){

            throw new AppException(404, "Consultation not found");
        }

        consultationRepo.updateConsultationCommentAndRatingById(id, payload);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeConsultation(ConsultationCompletePayload payload) {

        Consultation consultation = consultationRepo
                .findConsultationById(payload.getConsultationId())
                .orElseThrow(() -> new AppException(404, "Consultation not found with ID " +
                        payload.getConsultationId()));

        ConsultationStatus consultationStatus = consultation.getStatus();

        if (consultationStatus == ConsultationStatus.COMPLETED
                || consultationStatus == ConsultationStatus.CANCELLED) {

            throw new AppException
                    (400, "Consultation is already completed " +
                            "or has been cancelled");
        }

        boolean validateRealStartTime =
                payload.getRealStartTime().isBefore(consultation.getExpectedStartTime())
                        || payload.getRealStartTime().isAfter(consultation.getExpectedEndTime())
                        || payload.getRealStartTime().isEqual(consultation.getExpectedEndTime()) ;

        if(validateRealStartTime){

            throw new AppException(400, "Real Start Time cannot be " +
                    "before Expected Start Time or equal to or after Expected End Time");
        }

        boolean validateRealEndTime =
                payload.getRealEndTime().isBefore(consultation.getExpectedStartTime())
                        || payload.getRealEndTime().isAfter(consultation.getExpectedEndTime())
                        || payload.getRealEndTime().isEqual(consultation.getExpectedStartTime()) ;

        if(validateRealEndTime){

            throw new AppException(400, "Real End Time cannot be " +
                    "before or equal to Expected Start Time or after Expected End Time");
        }

        long startAndEndTimeDifference =
                ChronoUnit.MINUTES.between(payload.getRealStartTime(), payload.getRealEndTime());

        if(startAndEndTimeDifference < 20){

            throw new AppException(400,
                    "Real End time must be at least 20 minute later " +
                            "compared to Real Start time");
        }

        consultationRepo.completeConsultation(payload, ConsultationStatus.COMPLETED);
    }
}
