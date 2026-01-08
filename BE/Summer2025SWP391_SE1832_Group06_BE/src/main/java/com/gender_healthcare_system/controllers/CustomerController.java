package com.gender_healthcare_system.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.gender_healthcare_system.dtos.todo.*;
import com.gender_healthcare_system.entities.enu.GenderType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.user.ConsultantDTO;
import com.gender_healthcare_system.dtos.user.CustomerDTO;
import com.gender_healthcare_system.entities.user.AccountInfoDetails;
import com.gender_healthcare_system.payloads.login.LoginRequest;
import com.gender_healthcare_system.payloads.todo.ConsultationRegisterPayload;
import com.gender_healthcare_system.payloads.todo.EvaluatePayload;
import com.gender_healthcare_system.payloads.todo.MenstrualCreatePayload;
import com.gender_healthcare_system.payloads.todo.MenstrualCycleUpdatePayload;
import com.gender_healthcare_system.payloads.todo.SymptomCreatePayload;
import com.gender_healthcare_system.payloads.todo.SymptomUpdatePayload;
import com.gender_healthcare_system.payloads.todo.TestingServiceBookingRegisterPayload;
import com.gender_healthcare_system.payloads.user.CustomerPayload;
import com.gender_healthcare_system.payloads.user.CustomerUpdatePayload;
import com.gender_healthcare_system.services.AccountService;
import com.gender_healthcare_system.services.CertificateService;
import com.gender_healthcare_system.services.ConsultantService;
import com.gender_healthcare_system.services.ConsultationService;
import com.gender_healthcare_system.services.CustomerService;
import com.gender_healthcare_system.services.JwtService;
import com.gender_healthcare_system.services.MenstrualCycleService;
import com.gender_healthcare_system.services.SymptomService;
import com.gender_healthcare_system.services.TestingServiceBookingService;
import com.gender_healthcare_system.services.TestingServiceResultService;
import com.gender_healthcare_system.services.TestingService_Service;
import com.gender_healthcare_system.services.TestingServiceTypeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@Tag(name = "Customer APIs", description = "APIs for managing customer functionalities")
@RestController
@RequestMapping("/api/v1/customer")
@AllArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    private final ConsultationService consultationService;

    private final JwtService jwtService;

    private final AccountService accountService;

    private final AuthenticationManager authenticationManager;

    private final TestingServiceBookingService testingServiceBookingService;

    private final TestingService_Service testingService_service;

    private final TestingServiceResultService testingServiceResultService;

    private final ConsultantService consultantService;

    private final CertificateService certificateService;

    private final TestingServiceTypeService testingServiceTypeService;

    @Operation(
            summary = "Register a new customer",
            description = "Allows a new customer to register by providing necessary details."
    )
    @PostMapping("/register")
    public String register(@RequestBody @Valid CustomerPayload customerPayload)
            throws JsonProcessingException {
        accountService.createCustomerAccount(customerPayload);
        return "Customer registered successfully";
    }

    @Operation(
            summary = "Customer login",
            description = "Allows a customer to log in and receive a JWT token for authentication."
    )
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody @Valid LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                        loginRequest.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("Invalid Username or Password");
        }

        boolean hasRole = authentication
                .getAuthorities()
                .stream()
                .anyMatch(x -> x
                        .getAuthority().equals("ROLE_CUSTOMER"));

        if (!hasRole) {
            throw new UsernameNotFoundException
                    ("Access denied for non-customer user");
        }

        AccountInfoDetails account = (AccountInfoDetails) authentication.getPrincipal();
        int id = account.getId();

        LoginResponse loginDetails = customerService.getCustomerLoginDetails(id);

        Map<String, Object> responseMap = new HashMap<>();

        String jwtToken = jwtService.generateTokenForCustomer(id, loginRequest.getUsername(),
                account.getRolename(), loginDetails.getFullname(),
                loginDetails.getGender().getGender(), loginDetails.getEmail());

        responseMap.put("Customer ID", id);
        responseMap.put("Gender", loginDetails.getGender());
        responseMap.put("JWT token", jwtToken);

        return ResponseEntity.ok(responseMap);
    }

//    @Operation(
//            summary = "Get Customer Period Details",
//            description = "Get menstrual cycle details for a female customer"
//    )
//    //get period details for a female customers
////    @GetMapping("/female/period-details/{customerId}")
////    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
////  public ResponseEntity<CustomerPeriodDetailsDTO>
////    getPeriodDetailsForFemaleCustomer
////            (@PathVariable int customerId) throws JsonProcessingException {
////
////        return ResponseEntity.ok(customerService.getFemaleCustomerPeriodDetails(customerId));
////    }


    /// /////////////////////////////// Manage Customer Profile /////////////////////////////////

    @Operation(
            summary = "Get Customer Profile",
            description = "Get profile information of a customer by their ID."
    )
    //Customer get profile infos
    @GetMapping("/profile/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<CustomerDTO>
    getCustomerProfile(@PathVariable int id) throws JsonProcessingException {

        return ResponseEntity.ok(customerService.getCustomerById(id));

    }

    @Operation(
            summary = "Update Customer Profile",
            description = "Update profile information of a customer by their ID."
    )
    //Customer update profile infos
    @PutMapping("profile/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<?> updateCustomerProfile
            (@PathVariable int id, @RequestBody @Valid CustomerUpdatePayload payload)
            throws JsonProcessingException {

        customerService.updateCustomerDetails(id, payload);
        return ResponseEntity.ok("Customer profile updated successfully");
    }

    /// /////////////////////////////// Manage Testing Service Bookings /////////////////////////

    @Operation(
            summary = "Get all testing service types by Customer gender",
            description = "Retrieve a paginated list of all available testing service types for Customers filtered by Customer gender."
    )
    @GetMapping("/testing-service-types/list")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getAllTestingServiceTypesForCustomerByGender
    (@RequestParam(defaultValue = "MALE") GenderType gender,
     @RequestParam(defaultValue = "0") int page,
     @RequestParam(defaultValue = "serviceTypeId") String sort,
     @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(testingServiceTypeService
                .getAllTestingServiceTypesForCustomerByGender(gender, page, sort, order));
    }

    @Operation(
            summary = "Get all testing services for a testing service type",
            description = "Retrieve a list of all testing services belonging to a specific testing service type."
    )
    @GetMapping("/testing-services/of-type/{typeId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<TestingServiceDTO>> getAllTestingServicesForATestingTypes(@PathVariable int typeId) {
        return ResponseEntity.ok(testingService_service.getAllTestingServicesForATestingTypes(typeId));
    }

    /*@Operation(
            summary = "Get Testing Service by ID",
            description = "Retrieve details of a specific testing service by its ID."
    )
    //get price list for a testing service
    @GetMapping("/testing-services/price-list/{serviceId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<PriceListDTO>> getPriceListForTestingService
            (@PathVariable int serviceId) {

        return ResponseEntity.ok(
                priceListService.getPriceListForTestingService(serviceId));
    }*/

    //get testing templates for a testing service
    @GetMapping("/testing-services/test-templates/{serviceId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<TestingServiceResultDTO>> getTestTemplatesForTestingService
    (@PathVariable int serviceId) {

        return ResponseEntity.ok(
                testingServiceResultService.getAllServiceResultsByServiceId(serviceId));
    }

    //Lấy lịch xét nghiệm với các expected start time đã full lịch đặt (5 người)
    //và cả các expected start time customer đã đặt với testing service đó
    @GetMapping("/testing-service-bookings/check-schedule")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<String>> getTestingScheduleForADay
    (@RequestParam int serviceId,
     @RequestParam int customerId,
     @Parameter(example = "05/06/2025")
     @RequestParam("checkDate")
     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
     LocalDate checkDate) {

        return ResponseEntity.ok(testingServiceBookingService
                .getBookingScheduleForADay(serviceId, customerId, checkDate));
    }

    @Operation(
            summary = "Get Testing Service Booking by Customer ID",
            description = "Retrieve all testing service bookings made by a specific customer."
    )
    //Get Service bookings by customer ID
    @GetMapping("/testing-service-bookings/customer/{customerId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getTestingServiceBookingsByCustomerId
            (@PathVariable int customerId,
             @RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "serviceBookingId") String sort,
             @RequestParam(defaultValue = "asc") String order) {

        return ResponseEntity.ok(testingServiceBookingService
                .getAllTestingServiceBookingsByCustomerId(customerId, page, sort, order));
    }


    //thêm api lấy booking của customer
    @Operation(
            summary = "Get my Testing Service Bookings",
            description = "Customer lấy danh sách booking của chính mình (id lấy từ token)"
    )
    @GetMapping("/testing-service-bookings/my")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyTestingServiceBookings(
            @AuthenticationPrincipal AccountInfoDetails account,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "serviceBookingId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        int customerId = account.getId();
        return ResponseEntity.ok(testingServiceBookingService.getAllTestingServiceBookingsByCustomerId(customerId, page, sort, order));
    } 

    @Operation(
            summary = "Get Testing Service Booking Details by ID",
            description = "Retrieve details of a specific testing service booking by its ID."
    )
    //Get Testing Service Booking details by ID
    @GetMapping("/testing-service-bookings/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<TestingServiceBookingDTO>
    getTestingServiceBookingDetailsById(@PathVariable int id) throws JsonProcessingException {

        return ResponseEntity.ok(testingServiceBookingService.getTestingServiceBookingDetailsById(id));
    }

    @Operation(
            summary = "Get Testing Service Booking by ID",
            description = "Retrieve details of a specific testing service booking by its ID."
    )
    //register testing service booking
    @PostMapping("/testing-service-bookings/register")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> registerTestingServiceBooking
            (@RequestBody @Valid TestingServiceBookingRegisterPayload payload) {

        testingServiceBookingService.createTestingServiceBooking(payload);
        return ResponseEntity.ok("Testing Service Booking registered successfully");
    }

    @Operation(
            summary = "Evaluate Testing Service Booking",
            description = "Allows a customer to review and comment on a testing service booking."
    )
    //Review and comment Testing Service Booking
    @PutMapping("/testing-service-bookings/{id}/evaluate")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> updateTestingServiceBookingCommentAndRating
            (@PathVariable int id,
             @RequestBody @Valid EvaluatePayload payload) {

        testingServiceBookingService
                .updateTestingServiceBookingCommentAndRating(id, payload);
        return ResponseEntity.ok(
                "Testing Service Booking rating and comment updated successfully");
    }

    @Operation(
            summary = "Cancel Testing Service Booking",
            description = "Allows a customer to cancel a previously booked testing service."
    )
    //Cancel testing service booking
    @PutMapping("/testing-service-bookings/cancel/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> cancelTestingServiceBooking
            (@PathVariable int id) {
        testingServiceBookingService.cancelTestingServiceBooking(id);
        return ResponseEntity.ok("Testing Service Booking cancelled successfully");
    }

    /// /////////////////////////////// Manage Consultations ///////////////////////////////////

    @Operation(
            summary = "Get Customer Profile",
            description = "Get profile information of a customer by their ID."
    )
    //Get all consultant
    //lấy danh sách consltant cho customer chon và xem thông tin
    @GetMapping("/consultant-list/")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<ConsultantDTO>> getAllConsultantForCustomer() {
        return ResponseEntity.ok(consultantService.getAllConsultantsForCustomer());
    }

    @Operation(
            summary = "Get Consultant Certificates",
            description = "Retrieve all certificates of a consultant by their ID."
    )
    //get consultant certificates by ID
    @GetMapping("/consultant-list/certificates/{consultantId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<CertificateDTO>> getConsultantCertificates
            (@PathVariable int consultantId) {
        return ResponseEntity.ok(certificateService.getConsultantCertificates(consultantId));
    }

    @Operation(
            summary = "Get Consultation Types for Customer by Gender",
            description = "Retrieve all gender-specific consultation types a customer " +
                    "can choose from when booking consultation."
    )
    //Get consultations by customer ID
    @GetMapping("/consultations/consultation-types")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<ConsultationTypeDTO>> getAllConsultationTypesForCustomerByGender
            (@RequestParam(defaultValue = "MALE") GenderType gender) {

        return ResponseEntity.ok
                (consultationService.getAllConsultationTypesForCustomerByGender(gender));
    }

    // Lấy consultation của chính mình
    @Operation(
            summary = "Get my Consultations",
            description = "Customer lấy danh sách consultation của chính mình (id lấy từ token)"
    )
    @GetMapping("/consultations/my")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyConsultations(
            @AuthenticationPrincipal AccountInfoDetails account,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "consultationId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        int customerId = account.getId();
        return ResponseEntity.ok(consultationService.getConsultationsByCustomerId(customerId, page, sort, order));
    }

    // API cũ, kiểm tra bảo mật
    @Operation(
            summary = "Get Consultations by Customer ID (bảo mật)",
            description = "Customer chỉ được xem consultation của chính mình, nếu truyền id khác sẽ bị cấm."
    )
    @GetMapping("/consultations/customer/{customerId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getConsultationsByCustomerId(
            @PathVariable int customerId,
            @AuthenticationPrincipal AccountInfoDetails account,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "consultationId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        if (customerId != account.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu này!");
        }
        return ResponseEntity.ok(consultationService.getConsultationsByCustomerId(customerId, page, sort, order));
    }

    @Operation(
            summary = "Get Consultation by ID",
            description = "Retrieve details of a specific consultation by its ID for a customer."
    )
    //Get consultation by ID
    @GetMapping("/consultations/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<ConsultationDTO>
    getConsultationById(@PathVariable int id) {
        return ResponseEntity.ok(consultationService.getConsultationByIdForCustomer(id));
    }

    @Operation(
            summary = "Get Consultant Schedule by Date",
            description = "Retrieve the schedule of a consultant for a specific date."
    )
    //Get consultant schedule in a specific date for check
    @GetMapping("/consultations/consultant/{consultantId}/check-schedule")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<ConsultantScheduleDTO> getConsultantScheduleByDate
            (@PathVariable int consultantId,
             @Parameter(example = "05/06/2025")
             @RequestParam("date")
             @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
             LocalDate date) {

        return ResponseEntity.ok(consultationService
                .getConsultantScheduleByDate(consultantId, date));
    }

    @Operation(
            summary = "Register Consultation",
            description = "Allows a customer to register a new consultation with a consultant."
    )
    //register consultation
    @PostMapping("/consultations/register")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> registerConsultation
            (@RequestBody @Valid ConsultationRegisterPayload payload) {

        consultationService.registerConsultation(payload);
        return ResponseEntity.ok("Consultation registered successfully");
    }

    @Operation(
            summary = "Evaluate Consultation",
            description = "Allows a customer to review and comment on a consultation."
    )
    //Review and comment consultation
    @PutMapping("/consultations/{id}/evaluate")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> updateConsultationCommentAndRating
            (@PathVariable int id,
             @RequestBody @Valid EvaluatePayload payload) {

        consultationService.updateConsultationCommentAndRating(id, payload);
        return ResponseEntity.ok(
                "Consultation rating and comment updated successfully");
    }

    @Operation(
            summary = "Cancel Consultation",
            description = "Allows a customer to cancel a previously booked consultation."
    )
    //Cancel consultation
    @PutMapping("/consultations/cancel/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER ')")
    public ResponseEntity<String> cancelConsultation
            (@PathVariable int id) {
        consultationService.cancelConsultation(id);
        return ResponseEntity.ok("Consultation cancelled successfully");
    }

    /// ////////////Menstrual Cycle Management /////////////////////////
    private final MenstrualCycleService menstrualCycleService;

    @Operation(
            summary = "Create menstrual cycle",
            description = "Create a new menstrual cycle for a customer"
    )
    @PostMapping("/menstrual-cycles/create")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<MenstrualCycleDTO> createCycle(@RequestBody @Valid MenstrualCreatePayload payload, @AuthenticationPrincipal AccountInfoDetails account) {
        MenstrualCycleDTO createdCycle = menstrualCycleService.createCycle(payload, account.getId());
        return ResponseEntity.ok(createdCycle);
    }

    // Lấy menstrual cycles của chính mình
    @Operation(
            summary = "Get my Menstrual Cycles",
            description = "Customer lấy danh sách menstrual cycles của chính mình (id lấy từ token)"
    )
    @GetMapping("/menstrual-cycles/my")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<MenstrualCycleDTO>> getMyCycles(
            @AuthenticationPrincipal AccountInfoDetails account) {
        int customerId = account.getId();
        return ResponseEntity.ok(menstrualCycleService.getCyclesByCustomerId(customerId));
    }

    // API cũ, kiểm tra bảo mật
    @Operation(
            summary = "Get Menstrual Cycles by Customer ID (bảo mật)",
            description = "Customer chỉ được xem menstrual cycles của chính mình, nếu truyền id khác sẽ bị cấm."
    )
    @GetMapping("/menstrual-cycles/customer/{customerId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<MenstrualCycleDTO>> getCyclesByCustomerId(
            @PathVariable int customerId,
            @AuthenticationPrincipal AccountInfoDetails account) {
        if (customerId != account.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu này!");
        }
        return ResponseEntity.ok(menstrualCycleService.getCyclesByCustomerId(customerId));
    }

    @Operation(
            summary = "Update menstrual cycle",
            description = "Update a menstrual cycle by its ID"
    )
    @PutMapping("/menstrual-cycles/update/{cycleId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> updateCycleById(
            @PathVariable Integer cycleId,
            @RequestBody @Valid MenstrualCycleUpdatePayload payload
    ) {
        menstrualCycleService.updateCycleById(cycleId, payload);
        return ResponseEntity.ok("Updated menstrual cycle successfully");
    }

    // New APIs for isTrackingEnabled
    @Operation(
            summary = "Toggle tracking enabled",
            description = "Toggle the tracking enabled status of a menstrual cycle"
    )
    @PutMapping("/menstrual-cycles/{cycleId}/toggle-tracking")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> toggleTrackingEnabled(@PathVariable Integer cycleId) {
        menstrualCycleService.toggleTrackingEnabled(cycleId);
        return ResponseEntity.ok("Tracking status toggled successfully");
    }

    @Operation(
            summary = "Get active tracking cycles",
            description = "Get all active tracking cycles for the current customer"
    )
    @GetMapping("/menstrual-cycles/active-tracking")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<MenstrualCycleDTO>> getActiveTrackingCycles(
            @AuthenticationPrincipal AccountInfoDetails account) {
        int customerId = account.getId();
        return ResponseEntity.ok(menstrualCycleService.getActiveTrackingCycles(customerId));
    }

    // New APIs for flowVolume
    @Operation(
            summary = "Update flow volume",
            description = "Update the flow volume of a specific menstrual cycle"
    )
    @PutMapping("/menstrual-cycles/{cycleId}/flow-volume")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<MenstrualCycleDTO> updateFlowVolume(
            @PathVariable Integer cycleId,
            @RequestParam Integer flowVolume) {
        MenstrualCycleDTO updatedCycle = menstrualCycleService.updateFlowVolume(cycleId, flowVolume);
        return ResponseEntity.ok(updatedCycle);
    }

    @Operation(
            summary = "Get flow volume statistics",
            description = "Get statistics about flow volume for the current customer"
    )
    @GetMapping("/menstrual-cycles/flow-volume-statistics")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getFlowVolumeStatistics(
            @AuthenticationPrincipal AccountInfoDetails account) {
        int customerId = account.getId();
        return ResponseEntity.ok(menstrualCycleService.getFlowVolumeStatistics(customerId));
    }

    @Operation(
            summary = "Get cycles by flow volume range",
            description = "Get menstrual cycles within a specific flow volume range"
    )
    @GetMapping("/menstrual-cycles/flow-volume-range")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<MenstrualCycleDTO>> getCyclesByFlowVolumeRange(
            @AuthenticationPrincipal AccountInfoDetails account,
            @RequestParam(required = false) Integer minVolume,
            @RequestParam(required = false) Integer maxVolume) {
        int customerId = account.getId();
        return ResponseEntity.ok(menstrualCycleService.getCyclesByFlowVolumeRange(customerId, minVolume, maxVolume));
    }

    /// //////////////////////Symptom Management /////////////////////////
    private final SymptomService symptomService;

    @Operation(summary = "Create Symptom", description = "Record a new symptom for a customer")
    @PostMapping("/symptoms/create")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<SymptomDTO> createSymptom(@RequestBody @Valid SymptomCreatePayload payload) {
        return ResponseEntity.ok(symptomService.createSymptom(payload));
    }

    // Lấy symptoms của chính mình
    @Operation(summary = "Get my Symptoms", description = "Customer lấy danh sách symptoms của chính mình (id lấy từ token)")
    @GetMapping("/symptoms/my")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<SymptomDTO>> getMySymptoms(
            @AuthenticationPrincipal AccountInfoDetails account) {
        int customerId = account.getId();
        return ResponseEntity.ok(symptomService.getSymptomsByCustomerId(customerId));
    }

    // API cũ, kiểm tra bảo mật
    @Operation(summary = "Get Symptoms by Customer ID (bảo mật)", description = "Customer chỉ được xem symptoms của chính mình, nếu truyền id khác sẽ bị cấm.")
    @GetMapping("/symptoms/customer/{customerId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<List<SymptomDTO>> getSymptomsByCustomerId(
            @PathVariable int customerId,
            @AuthenticationPrincipal AccountInfoDetails account) {
        if (customerId != account.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu này!");
        }
        return ResponseEntity.ok(symptomService.getSymptomsByCustomerId(customerId));
    }

    @Operation(summary = "Update Symptom", description = "Update a previously recorded symptom")
    @PutMapping("/symptoms/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> updateSymptom(
            @PathVariable Integer id,
            @RequestBody @Valid SymptomUpdatePayload payload) {
        symptomService.updateSymptom(id, payload);
        return ResponseEntity.ok("Symptom updated successfully");
    }

    @Operation(summary = "Delete Symptom", description = "Delete a previously recorded symptom")
    @DeleteMapping("/symptoms/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<String> deleteSymptom(@PathVariable Integer id) {
        symptomService.deleteSymptom(id);
        return ResponseEntity.ok("Symptom deleted successfully");
    }

    
    @Operation(
            summary = "Get customer age information",
            description = "Get detailed age information including perimenopausal status for a customer"
    )
    @GetMapping("/age-info/{customerId}")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerAgeInfo(
            @PathVariable int customerId,
            @AuthenticationPrincipal AccountInfoDetails account) throws JsonProcessingException {
        // Security check: customer can only view their own age info
        if (customerId != account.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thông tin này!");
        }
        return ResponseEntity.ok(customerService.getCustomerAgeInfo(customerId));
    }

    @Operation(
            summary = "Get my age information",
            description = "Customer lấy thông tin tuổi của chính mình (id lấy từ token)"
    )
    @GetMapping("/age-info/my")
    @PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getMyAgeInfo(
            @AuthenticationPrincipal AccountInfoDetails account) throws JsonProcessingException {
        int customerId = account.getId();
        return ResponseEntity.ok(customerService.getCustomerAgeInfo(customerId));
    }

    @Operation(
            summary = "Get perimenopausal customers (Manager only)",
            description = "Get all customers in perimenopausal age range (40-50 years old)"
    )
    @GetMapping("/perimenopausal-customers")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getPerimenopausalCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "accountId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(customerService.getPerimenopausalCustomers(page, sort, order));
    }

    @Operation(
            summary = "Get customers by age range (Manager only)",
            description = "Get customers within a specific age range"
    )
    @GetMapping("/customers-by-age-range")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getCustomersByAgeRange(
            @RequestParam int minAge,
            @RequestParam int maxAge,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "accountId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(customerService.getCustomersByAgeRange(minAge, maxAge, page, sort, order));
    }
}