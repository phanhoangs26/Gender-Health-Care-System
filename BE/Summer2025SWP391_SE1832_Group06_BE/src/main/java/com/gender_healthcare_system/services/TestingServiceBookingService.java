package com.gender_healthcare_system.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gender_healthcare_system.dtos.todo.TestingResultDetailsDTO;
import com.gender_healthcare_system.dtos.todo.TestingServiceBookingDTO;
import com.gender_healthcare_system.entities.enu.*;
import com.gender_healthcare_system.entities.todo.TestingService;
import com.gender_healthcare_system.entities.todo.TestingServiceBooking;
import com.gender_healthcare_system.entities.todo.TestingServicePayment;
import com.gender_healthcare_system.entities.user.Account;
import com.gender_healthcare_system.exceptions.AppException;
import com.gender_healthcare_system.payloads.todo.*;
import com.gender_healthcare_system.repositories.*;
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
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@AllArgsConstructor
public class TestingServiceBookingService {

    private final AccountRepo accountRepo;
    private final TestingServiceRepo testingServiceRepo;
    private final TestingServiceBookingRepo testingServiceBookingRepo;
    private final TestingServicePaymentRepo testingServicePaymentRepo;

    // Get TestingServiceBooking entity by id
    public TestingServiceBookingDTO getTestingServiceBookingDetailsById(int id)
            throws JsonProcessingException {
        TestingServiceBookingDTO testingService = testingServiceBookingRepo
                .getTestingBookingDetailsById(id)
                .orElseThrow(() -> new AppException(404,
                        "Testing Service Booking not found with ID: " + id));

        String result = testingService.getResult();

        if (!StringUtils.isEmpty(result)) {
            ObjectMapper mapper = new ObjectMapper();
            //mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

            TestingResultDetailsDTO results = mapper
                    .readValue(result, TestingResultDetailsDTO.class);

            testingService.setResults(results);
        }

        return testingService;
    }

    // Get all TestingServiceBookings by Customer ID with pagination
    public Map<String, Object> getAllTestingServiceBookingsByCustomerId(int customerId, int page, String sortField,
            String sortOrder) {

        boolean customerExist = accountRepo.existsByAccountIdAndRole_RoleName(customerId, "CUSTOMER");
        if (!customerExist) {
            throw new AppException(404, "Customer not found with ID: " + customerId);
        }

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);
        if (sortOrder.equalsIgnoreCase("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageable = PageRequest.of(page, itemSize, sort);
        Page<TestingServiceBookingDTO> pageResult = testingServiceBookingRepo
                .getAllTestingServiceBookingsByCustomerId(customerId, pageable);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Testing Service Bookings found");
        }

        List<TestingServiceBookingDTO> bookingList = pageResult.getContent();
        bookingList.forEach(x -> x.setCustomerName(null));

        Map<String, Object> response = new HashMap<>();
        response.put("totalItems", pageResult.getTotalElements());
        response.put("testingServiceBookings", bookingList);
        response.put("totalPages", pageResult.getTotalPages());
        response.put("currentPage", pageResult.getNumber());

        return response;
    }

    // Get all TestingServiceBookings by Staff ID with pagination
    public Map<String, Object> getAllTestingServiceBookingsByStaffId(int staffId, int page, String sortField,
            String sortOrder) {

        boolean staffExist = accountRepo.existsByAccountIdAndRole_RoleName(staffId, "STAFF");
        if (!staffExist) {
            throw new AppException(404, "Staff not found with ID: " + staffId);
        }

        final int itemSize = 10;

        Sort sort = Sort.by(Sort.Direction.ASC, sortField);
        if (sortOrder.equalsIgnoreCase("desc")) {
            sort = Sort.by(Sort.Direction.DESC, sortField);
        }

        Pageable pageable = PageRequest.of(page, itemSize, sort);
        Page<TestingServiceBookingDTO> pageResult = testingServiceBookingRepo
                .getAllTestingServiceBookingsByStaffId(staffId, pageable);

        if (!pageResult.hasContent()) {
            throw new AppException(404, "No Testing Service Bookings found");
        }

        List<TestingServiceBookingDTO> bookingList = pageResult.getContent();
        bookingList.forEach(x -> x.setStaffName(null));

        Map<String, Object> response = new HashMap<>();
        response.put("totalItems", pageResult.getTotalElements());
        response.put("testingServiceBookings", bookingList);
        response.put("totalPages", pageResult.getTotalPages());
        response.put("currentPage", pageResult.getNumber());

        return response;
    }

    public List<String> getBookingScheduleForADay(int serviceId, int customerId, LocalDate checkDate) {

        List<LocalDateTime> bookingSchedule = testingServiceBookingRepo.getBookingScheduleInADate(checkDate,
                TestingServiceBookingStatus.CANCELLED);

        List<LocalDateTime> customerBookedSchedule = testingServiceBookingRepo
                .getCustomerBookedScheduleInADate(serviceId, customerId, checkDate,
                        TestingServiceBookingStatus.CANCELLED);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        List<String> finalBookingSchedule = Stream
                .concat(bookingSchedule.stream(), customerBookedSchedule.stream())
                .distinct()
                .sorted()
                .map(dateTime -> dateTime.format(formatter))
                .toList();

        if (finalBookingSchedule.isEmpty()) {

            throw new AppException(404, "No booked schedule found for date " + checkDate);
        }

        return finalBookingSchedule;
    }

    // Create new TestingServiceBooking with payment
    @Transactional(rollbackFor = Exception.class)
    public void createTestingServiceBooking(TestingServiceBookingRegisterPayload payload) {

        UtilFunctions.validateExpectedStartTime(payload.getExpectedStartTime());

        UtilFunctions.validatePaymentInput(payload.getPayment().getMethod(),
                payload.getPayment().getTransactionId());

        boolean bookingExist = testingServiceBookingRepo
                .existsByTestingService_ServiceIdAndCustomer_AccountIdAndExpectedStartTime(payload.getServiceId(),
                        payload.getCustomerId(), payload.getExpectedStartTime());

        if (bookingExist) {
            throw new AppException(409, "Testing Service has already been booked");
        }

        Account customer = accountRepo.findById(payload.getCustomerId())
                .orElseThrow(() -> new AppException(404,
                        "Customer not found with ID " + payload.getCustomerId()));

        TestingService testingService = testingServiceRepo.findById(payload.getServiceId())
                .orElseThrow(() -> new AppException(404,
                        "Testing Service not found with ID " + payload.getServiceId()));
        // Lấy targetGender từ TestingServiceType
        String serviceTargetGender = testingService.getTestingServiceType().getTargetGender().getType();
        String customerGender = customer.getGender().getGender();

        if(!serviceTargetGender.equals("ANY")
        && !customerGender.equals(serviceTargetGender)){

            throw new AppException(400, "Customer with gender "+ customerGender +
                    " cannot book Testing Service with target gender of " +
                    serviceTargetGender);
        }

        // Auto-assign staff based on availability
        LocalDate dateExtraction = payload.getExpectedStartTime().toLocalDate();
        List<Object[]> staffList = accountRepo.findStaffOrderedByLeastTests(dateExtraction, AccountStatus.ACTIVE);

        if (staffList.isEmpty()) {
            throw new AppException(500, "No Staff found to assign Test to, please try again later");
        }

        Object[] firstStaff = staffList.getFirst();
        Account staff = accountRepo.findById((Integer) firstStaff[1])
                .orElseThrow(() -> new AppException(500, "Error when trying to get Staff info"));

        TestingServiceBooking testingServiceBooking = new TestingServiceBooking();

        testingServiceBooking.setCreatedAt(UtilFunctions.getCurrentDateTimeWithTimeZone());
        testingServiceBooking.setExpectedStartTime(payload.getExpectedStartTime());
        LocalDateTime expectedEndTime = payload.getExpectedStartTime().plusHours(1);
        testingServiceBooking.setExpectedEndTime(expectedEndTime);
        testingServiceBooking.setStatus(TestingServiceBookingStatus.CONFIRMED);
        testingServiceBooking.setRating(Rating.AVERAGE);
        testingServiceBooking.setCustomer(customer);
        testingServiceBooking.setStaff(staff);
        testingServiceBooking.setTestingService(testingService);

        testingServiceBookingRepo.saveAndFlush(testingServiceBooking);

        TestingServicePayment testingServicePayment = new TestingServicePayment();

        testingServicePayment.setTestingServiceBooking(testingServiceBooking);

        if(payload.getPayment().getMethod() == PaymentMethod.CASH){

            String transactionId = UtilFunctions.generateTransactionId();
            testingServicePayment.setTransactionId(transactionId);
        }

        if(payload.getPayment().getMethod() == PaymentMethod.BANKING){

            testingServicePayment.setTransactionId(payload.getPayment().getTransactionId());
        }

        testingServicePayment.setAmount(payload.getPayment().getAmount());
        testingServicePayment.setMethod(payload.getPayment().getMethod());

        LocalDateTime createdAt = UtilFunctions
                .convertTimeStampToLocalDateTime(payload.getPayment().getCreatedAtTimeStamp());

        testingServicePayment.setCreatedAt(createdAt);
        testingServicePayment.setDescription(payload.getPayment().getDescription());
        testingServicePayment.setStatus(PaymentStatus.PAID);

        testingServicePaymentRepo.saveAndFlush(testingServicePayment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeTestingServiceBooking(int id, TestingServiceBookingCompletePayload payload)
            throws JsonProcessingException {

        TestingServiceBooking serviceBooking = testingServiceBookingRepo.getTestingServiceBookingById(id)
                .orElseThrow(() -> new AppException(404,
                        "Testing Service Booking not found with ID: " + id));

        TestingServiceBookingStatus bookingStatus = serviceBooking.getStatus();

        if (bookingStatus == TestingServiceBookingStatus.CANCELLED
                || bookingStatus == TestingServiceBookingStatus.COMPLETED) {

            throw new AppException(400, "Cannot complete an already cancelled or " +
                    "completed Service Booking");
        }

        UtilFunctions.validateRealStartAndEndTime(serviceBooking.getExpectedStartTime(),
                serviceBooking.getExpectedEndTime(),
                payload.getRealStartTime(), payload.getRealEndTime());

        UtilFunctions.validateRealTestResult(payload.getResultList());

        ObjectMapper mapper = new ObjectMapper();
        TestingResultDetailsPayload result = new
                TestingResultDetailsPayload(payload.getResultList(), payload.getOverallResult());

        String resultString = mapper.writeValueAsString(result);

        testingServiceBookingRepo.completeTestingServiceBooking(id, payload.getRealStartTime(),
                payload.getRealEndTime(), resultString,
                TestingServiceBookingStatus.COMPLETED);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startTestingServiceBooking(int id, LocalDateTime realStartTime) {
        boolean bookingExist = testingServiceBookingRepo.existsById(id);

        if (!bookingExist) {
            throw new AppException(404, "Testing Service Booking not found");
        }

        testingServiceBookingRepo.startTestingServiceBooking(id, realStartTime);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateTestingServiceBookingCommentAndRating(int id, EvaluatePayload payload) {
        boolean bookingExist = testingServiceBookingRepo.existsById(id);

        if (!bookingExist) {
            throw new AppException(404, "Testing Service Booking not found");
        }

        testingServiceBookingRepo.updateServiceBookingCommentAndRatingById(id, payload);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelTestingServiceBooking(int id) {
        boolean bookingExist = testingServiceBookingRepo.existsById(id);

        if (!bookingExist) {
            throw new AppException(404, "Testing Service Booking not found");
        }

        testingServiceBookingRepo.cancelTestingServiceBooking(id, TestingServiceBookingStatus.CANCELLED);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteTestingServiceBooking(int id) {
        boolean bookingExist = testingServiceBookingRepo.existsById(id);

        if (!bookingExist) {
            throw new AppException(404, "Testing Service Booking not found");
        }

        testingServiceBookingRepo.deleteTestingServiceBooking(id);
    }

    public String checkOverallResultForTestingBooking
            (int bookingId, List<String> resultList) {

        boolean bookingExist = testingServiceBookingRepo.existsById(bookingId);

        if(!bookingExist){

            throw new AppException(404,
                    "Testing Service Booking not found with ID: " + bookingId);
        }

        String logic = testingServiceBookingRepo
                .getTestingServiceFlagLogicByBookingId(bookingId);

        if (resultList == null || resultList.isEmpty()) {
            throw new AppException(400, "No test result found for this booking");
        }

    /*    try {
            ObjectMapper mapper = new ObjectMapper();
            resultList = mapper.readValue(resultJson, new TypeReference<List<TestingServiceResultDTO>>(){});
        } catch (Exception e) {
            throw new AppException(500, "Error parsing test result JSON");
        }*/

        // Đếm số positive/negative
        long positive = resultList.stream().filter(r -> r.equalsIgnoreCase("POSITIVE")).count();
        long listCount = resultList.size();
        //long negative = resultList.stream().filter(r -> r.equalsIgnoreCase("NEGATIVE")).count();
        // Xử lý logic tổng quát (ví dụ: ALL_NEGATIVE, ANY_POSITIVE, ...)
        //if (logic == null || logic.isEmpty()) return "UNKNOWN";

        switch (logic) {
            case "ALL_POSITIVE":
                return positive == listCount ? "POSITIVE" : "NEGATIVE";
            case "ANY_POSITIVE":
                return positive > 0 ? "POSITIVE" : "NEGATIVE";
            default:
                return "INDETERMINATE";
        }
    }
}
