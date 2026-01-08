package com.gender_healthcare_system.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.todo.TestingServiceBookingDTO;
import com.gender_healthcare_system.dtos.todo.TestingServiceResultDTO;
import com.gender_healthcare_system.entities.enu.PaymentStatus;
import com.gender_healthcare_system.entities.todo.TestingServicePayment;
import com.gender_healthcare_system.entities.user.AccountInfoDetails;
import com.gender_healthcare_system.payloads.login.LoginRequest;
import com.gender_healthcare_system.payloads.todo.TestingServiceBookingCompletePayload;
import com.gender_healthcare_system.services.JwtService;
import com.gender_healthcare_system.services.StaffService;
import com.gender_healthcare_system.services.TestingServiceBookingService;
import com.gender_healthcare_system.services.TestingServicePaymentService;
import com.gender_healthcare_system.services.TestingServiceResultService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@Tag(name = "Staff APIs", description = "APIs for managing staff functionalities")
@RestController
@RequestMapping("/api/v1/staff")
@AllArgsConstructor
public class StaffController {

    private final TestingServicePaymentService testingServicePaymentService;

    private final StaffService staffService;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final TestingServiceResultService testingServiceResultService;

    private final TestingServiceBookingService testingServiceBookingService;

    @Operation(
            summary = "Staff login",
            description = "Allows a staff member to log in and receive a JWT token for authentication."
    )
    //Staff login
    @PostMapping("/login")
    public ResponseEntity<String> login
            (@RequestBody @Valid LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                        loginRequest.getPassword())
        );
        if (!authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("Invalid username or password");
        }

        boolean hasRole = authentication
                .getAuthorities()
                .stream()
                .anyMatch(x -> x.getAuthority().equals("ROLE_STAFF"));

        if (!hasRole) {
            throw new UsernameNotFoundException("Access denied for non-staff user");
        }

        AccountInfoDetails account = (AccountInfoDetails) authentication.getPrincipal();
        int id = account.getId();

        LoginResponse loginDetails = staffService.getStaffLoginDetails(id);
        //loginDetails.setUsername(loginRequest.getUsername());

        String jwtToken = jwtService.generateToken(id, loginRequest.getUsername(),
                account.getRolename(), loginDetails.getFullname(), loginDetails.getEmail());
        //loginDetails.setToken(jwtToken);

        return ResponseEntity.ok(jwtToken);
    }


    /// ////////////////////////// Manage Payments ///////////////////////////////

    @Operation(
            summary = "Manage Testing Service Payments",
            description = "APIs for managing testing service payments including creating, updating, and retrieving payments."
    )
    // 1. Get all payments
    @GetMapping("/payments/")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<List<TestingServicePayment>> getAllPayments() {
        return ResponseEntity.ok(testingServicePaymentService.getAllPayments());
    }

    @Operation(
            summary = "Get Payment by ID",
            description = "Retrieve a specific payment by its ID."
    )
    // 2. Get payment by ID
    @GetMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<TestingServicePayment> getPaymentById(@PathVariable int id) {
        return ResponseEntity.ok(testingServicePaymentService.getPaymentById(id));
    }

    @Operation(
            summary = "Create a new Testing Service Payment",
            description = "Create a new payment record for testing services."
    )
    // 3. Create new testingServicePayment
    @PostMapping("/payments/")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<TestingServicePayment> createPayment(@RequestBody TestingServicePayment testingServicePayment) {
        return ResponseEntity.ok(testingServicePaymentService.createPayment(testingServicePayment));
    }

    @Operation(
            summary = "Update an existing Testing Service Payment",
            description = "Update the details of an existing payment record."
    )
    // 4. Update testingServicePayment
    @PutMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<TestingServicePayment> updatePayment(@PathVariable int id, @RequestBody TestingServicePayment testingServicePayment) {
        return ResponseEntity.ok(testingServicePaymentService.updatePayment(id, testingServicePayment));
    }

    @Operation(
            summary = "Delete a Testing Service Payment",
            description = "Delete a specific payment record by its ID."
    )
    // 5. Delete payment
    @DeleteMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<String> deletePayment(@PathVariable int id) {
        testingServicePaymentService.deletePayment(id);
        return ResponseEntity.ok("Payment deleted successfully");
    }

    @Operation(
            summary = "Get Payments by User ID",
            description = "Retrieve all payments made by a specific user."
    )
    // 7. Get payments by status
    @GetMapping("/payments/status/{status}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<List<TestingServicePayment>> getPaymentsByStatus(@PathVariable String status) {
        try {
            PaymentStatus parsedStatus = PaymentStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(testingServicePaymentService.getPaymentsByStatus(parsedStatus));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid payment status: " + status);
        }
    }

    // 8. Update payment status
    @PutMapping("/payments/{id}/update-status")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<TestingServicePayment> updatePaymentStatus(@PathVariable int id, @RequestParam String newStatus) {
        try {
            PaymentStatus status = PaymentStatus.valueOf(newStatus.toUpperCase());
            return ResponseEntity.ok(testingServicePaymentService.updatePaymentStatus(id, status));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid payment status: " + newStatus);
        }
    }


    /// ////////////////////////////////////// Manage Testing Service Bookings //////////////////////////////////////

    //get by id
    @GetMapping("/testing-service-bookings/{testingBookingId}/testing-templates")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<List<TestingServiceResultDTO>>
    getTestingBookingTestTemplatesById
    (@PathVariable int testingBookingId) {
        return ResponseEntity.ok(
                testingServiceResultService.getAllServiceResultsByBookingId(testingBookingId));
    }

    @Operation(
            summary = "Get Testing Service Booking by ID",
            description = "Retrieve details of a specific testing service booking by its ID."
    )
    @GetMapping("/testing-service-bookings/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<TestingServiceBookingDTO>
    getTestingServiceBookingById(@PathVariable int id) throws JsonProcessingException {
        return ResponseEntity.ok(testingServiceBookingService.getTestingServiceBookingDetailsById(id));
    }

    //Lấy danh sách (có phân trang + sắp xếp)
    // vd:/staff/testing-service-history?page=0&sortField=createdAt&sortOrder=desc
    @GetMapping("/testing-service-bookings/staff/{staffId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<Map<String, Object>> getAllTestingServiceBookings(
            @PathVariable int staffId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "serviceBookingId") String sortField,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        return ResponseEntity.ok(testingServiceBookingService
                .getAllTestingServiceBookingsByStaffId(staffId, page, sortField, sortOrder));
    }

    @Operation(
            summary = "Complete Testing Service Booking",
            description = "Mark a testing service booking as completed and upload the result."
    )
    @PutMapping("/testing-service-bookings/{id}/complete")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<String> completeTestingServiceBooking(
            @PathVariable int id,
            @RequestBody @Valid TestingServiceBookingCompletePayload payload)
            throws JsonProcessingException {
        testingServiceBookingService.completeTestingServiceBooking(id, payload);
        return ResponseEntity.ok("Testing Service Booking marked as completed");
    }

    @Operation(
            summary = "Delete Testing Service Booking",
            description = "Delete a specific testing service booking by its ID."
    )
    @DeleteMapping("/testing-service-bookings/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<String> deleteTestingServiceBooking(@PathVariable int id) {
        testingServiceBookingService.deleteTestingServiceBooking(id);
        return ResponseEntity.ok("Testing Service Booking deleted successfully");
    }

    @Operation(
            summary = "Check overall result for a testing booking",
            description = "Check the overall result for a testing booking based on positive/negative result templates."
    )
    @PostMapping("/testing-service-bookings/{bookingId}/overall-result")
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    public ResponseEntity<String> checkOverallResultForTestingBooking
            (@PathVariable int bookingId,
             @RequestBody List<String> resultList) {
        String result = testingServiceBookingService.
                checkOverallResultForTestingBooking(bookingId, resultList);
        return ResponseEntity.ok(result);
    }
}
