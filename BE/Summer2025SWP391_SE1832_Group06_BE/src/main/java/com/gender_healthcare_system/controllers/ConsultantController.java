package com.gender_healthcare_system.controllers;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.todo.ConsultationDTO;
import com.gender_healthcare_system.dtos.todo.ConsultantScheduleDTO;
import com.gender_healthcare_system.dtos.user.ConsultantDTO;
import com.gender_healthcare_system.entities.user.AccountInfoDetails;
import com.gender_healthcare_system.payloads.login.LoginRequest;
import com.gender_healthcare_system.payloads.todo.CertificateUpdatePayload;
import com.gender_healthcare_system.payloads.todo.ConsultationCompletePayload;
import com.gender_healthcare_system.payloads.todo.ConsultationConfirmPayload;
import com.gender_healthcare_system.payloads.user.ConsultantUpdatePayload;
import com.gender_healthcare_system.services.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@Tag(name = "Consultant APIs", description = "APIs for managing consultant functionalities")
@RestController
@RequestMapping("/api/v1/consultant")
@AllArgsConstructor
public class ConsultantController {

    private final ConsultationService consultationService;
    
    private final ConsultantService consultantService;

    private final CertificateService certificateService;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    @Operation(
            summary = "Consultant login",
            description = "Allows a consultant to log in and receive a JWT token for authentication."
    )
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login
            (@RequestBody @Valid LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        if (!authentication.isAuthenticated()) {
            throw new RuntimeException("Invalid Username or Password");
        }

        boolean hasRole = authentication.getAuthorities()
                .stream()
                .anyMatch(auth ->
                        auth.getAuthority().equals("ROLE_CONSULTANT"));

        if (!hasRole) {
            throw new UsernameNotFoundException("Access denied for non-consultant user");
        }

        AccountInfoDetails account =
                (AccountInfoDetails) authentication.getPrincipal();
        int id = account.getId();

        LoginResponse loginDetails = consultantService
                .getConsultantLoginDetails(id);
        //loginDetails.setUsername(loginRequest.getUsername());

        String jwtToken = jwtService.generateToken(id, loginRequest.getUsername(),
                account.getRolename(), loginDetails.getFullname(), loginDetails.getEmail());

        loginDetails.setToken(jwtToken);
        loginDetails.setFullname(null);
        loginDetails.setEmail(null);

        return ResponseEntity.ok(loginDetails);
    }



    ////////////////////////////////// Manage Profile ///////////////////////////////////

    @Operation(
            summary = "Get Consultant Profile",
            description = "Get profile information of a consultant by their ID."
    )
    //Consultant get profile infos
    @GetMapping("/profile/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<ConsultantDTO>
    getConsultantProfile(@PathVariable int id) {

        ConsultantDTO consultantDetails = consultantService.getConsultantDetails(id);
        if (consultantDetails != null) {
            return ResponseEntity.ok(consultantDetails);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Update consultant profile",
            description = "Update personal information of consultant"
    )
    //Consultant update profile personal infos
    @PutMapping("profile/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<?> updateConsultantProfile
    (@PathVariable int id, @RequestBody @Valid ConsultantUpdatePayload payload) {

        consultantService.updateConsultantDetails(id, payload);
        return ResponseEntity.ok("Consultant profile updated successfully");
    }


    ////////////////////////////////// Manage Certificates ///////////////////////////////////

    @Operation(
            summary = "Update consultant certificate information",
            description = "Update certificate-related details of consultant"
    )
    //Consultant update certificate infos
    @PutMapping("certificates/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<?> updateConsultantCertificate
    (@PathVariable int id, @RequestBody @Valid CertificateUpdatePayload payload) {

        certificateService.updateConsultantCertificate(id, payload);
        return ResponseEntity.ok("Consultant certificate updated successfully");
    }


    ////////////////////////////////// Manage Consultations ///////////////////////////////////

    @Operation(
            summary = "Get all consultations by consultant ID",
            description = "Get paginated consultations assigned to a specific consultant"
    )
    //Get all consultations by consultant ID
    @GetMapping("/consultations/consultantId/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<Map<String, Object>>
    getConsultationsByConsultantId(@PathVariable int id,
                     @RequestParam(defaultValue = "0") int page,
                     @RequestParam(defaultValue = "accountId") String sort, // sửa lại sortField hợp lệ
                     @RequestParam(defaultValue = "asc") String order ) {

        return ResponseEntity.ok(consultationService
                .getConsultationsByConsultantId(id, page, sort, order));
    }

    @Operation(
            summary = "Get consultation details",
            description = "Retrieve a specific consultation by ID"
    )
    //Get consultation by ID
    @GetMapping("/consultations/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<ConsultationDTO>
    getConsultationById(@PathVariable int id) throws JsonProcessingException {
        ConsultationDTO dto = consultationService.getConsultationById(id);
        return ResponseEntity.ok(dto);
    }

    //Confirm consultation
    /*@PostMapping("/consultations/confirm")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<String> confirmConsultation(@RequestBody ConsultationConfirmPayload payload) {
        consultationService.confirmConsultation(payload);
        return ResponseEntity.ok("Consultation confirmed successfully");
    }*/

    //Cancel consultation
    //Can consultant actually cancel consultation
    /*@PostMapping("/consultations/cancel/{id}")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<String> cancelConsultation
    (@PathVariable int id) {
        consultationService.cancelConsultation(id);
        return ResponseEntity.ok("Consultation cancelled successfully");
    }*/

    //update consultant có thể check lịch trước khi reschedule consultation.
    //Get consultant schedule in a specific date for check
    @Operation(
            summary = "Check consultant schedule for a specific date",
            description = "Returns time slots or availability of the consultant on a given date"
    )
    @GetMapping("/consultations/consultant/{consultantId}/check-schedule")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
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
            summary = "Reschedule a consultation",
            description = "Allows consultant to reschedule an existing consultation"
    )
    //Reschedule consultation
    @PostMapping("/consultations/{id}/reschedule/")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<String> reScheduleConsultation
    (@PathVariable int id, @RequestBody @Valid ConsultationConfirmPayload payload) {

        consultationService.reScheduleConsultation(id, payload);
        return ResponseEntity.ok("Consultation rescheduled successfully");
    }

    @Operation(
            summary = "Complete a consultation",
            description = "Marks the consultation as completed and stores notes/results"
    )
    //Complete consultation
    @PostMapping("/consultations/complete")
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<String> completeConsultation
    (@RequestBody @Valid ConsultationCompletePayload payload) {

        consultationService.completeConsultation(payload);
        return ResponseEntity.ok("Consultation completed successfully");
    }

}
