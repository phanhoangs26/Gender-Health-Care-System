package com.gender_healthcare_system.controllers;

import com.gender_healthcare_system.dtos.report.StatisticResponseDTO;
import com.gender_healthcare_system.dtos.user.ManagerDTO;
import com.gender_healthcare_system.entities.user.AccountInfoDetails;
import com.gender_healthcare_system.payloads.login.LoginRequest;
import com.gender_healthcare_system.payloads.user.ManagerRegisterPayload;
import com.gender_healthcare_system.payloads.user.ManagerUpdatePayload;
import com.gender_healthcare_system.services.AccountService;
import com.gender_healthcare_system.services.JwtService;
import com.gender_healthcare_system.services.ManagerService;
import com.gender_healthcare_system.services.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

import java.util.List;
import java.util.Map;

@Tag(name = "Admin Management", description = "APIs for managing admin functionalities")
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final ManagerService managerService;

    private final AccountService accountService;

    private final ReportService reportService;

    @Operation(
            summary = "Admin login",
            description = "Allows an admin to log in and receive a JWT token for authentication."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    //Admin login
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                        loginRequest.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            throw new RuntimeException("Invalid Username or Password");
        }

        boolean hasRole = authentication
                .getAuthorities()
                .stream()
                .anyMatch(x -> x
                        .getAuthority().equals("ROLE_ADMIN"));

        if (!hasRole) {
            throw new UsernameNotFoundException
                    ("Access denied for non-admin user");
        }

        //AdminLoginResponse adminLoginDetails = new AdminLoginResponse();

        AccountInfoDetails account =
                (AccountInfoDetails) authentication.getPrincipal();
        int id = account.getId();

        //adminLoginDetails.setId(id);
        //adminLoginDetails.setUsername(loginRequest.getUsername());

        String jwtToken = jwtService.generateTokenForAdmin(id,
                loginRequest.getUsername(), account.getRolename());
        //adminLoginDetails.setToken(jwtToken);

        return ResponseEntity.ok(jwtToken);
    }

    /// //////////////////////// Manage Statistic Reports //////////////////////////////////
    @Operation(
            summary = "Get statistics of consultations",
            description = "Get statistics about consultations within a specified number of days (default 30)."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/statistic-reports/consultations")
    public ResponseEntity<List<StatisticResponseDTO>> getConsultationsStatistics(
            @RequestParam(defaultValue = "30") int periodByDays) {

        return ResponseEntity.ok(reportService.getConsultationsStatistics(periodByDays));
    }

    @Operation(
            summary = "Get statistics of testing service bookings",
            description = "Get statistics about testing service bookings within a specified number of days (default 30)."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/statistic-reports/testing-service-bookings")
    public ResponseEntity<List<StatisticResponseDTO>> getTestingBookingsStatistics
            (@RequestParam(defaultValue = "30") int periodDays) {

        return ResponseEntity.ok(
                reportService.getTestingBookingsStatistics(periodDays));
    }

    @Operation(
            summary = "Get total number of users",
            description = "Returns the total count of users in the system."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/statistic-reports/users/count")
    public ResponseEntity<?> getTotalUserCount() {
        long count = reportService.getTotalUserCount();
        return ResponseEntity.ok(count);
    }

    /// //////////////////////// Manage Managers /////////////////////////////////////

    @Operation(
            summary = "Get list of managers",
            description = "Returns paginated, sorted list of all managers (admin only)."
    )
    //Admin get all Managers
    @GetMapping("/managers/")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllManagers
    (@RequestParam(defaultValue = "0") int page,
     @RequestParam(defaultValue = "accountId") String sort,
     @RequestParam(defaultValue = "asc") String order) {

        return ResponseEntity.ok(managerService.getAllManagers(page, sort, order));
    }

    //Admin get Manager details by id
    @GetMapping("/managers/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ManagerDTO>
    getManagerDetailsById(@PathVariable int id) {

        return ResponseEntity.ok(managerService.getManagerDetails(id));
    }

    @Operation(
            summary = "Create new manager account",
            description = "Allows admin to create a new manager account with initial information."
    )
    //Admin create a new Manager
    @PostMapping("/managers/register")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createManagerAccount
    (@RequestBody @Valid ManagerRegisterPayload payload) {
        accountService.createManagerAccount(payload);
        return ResponseEntity.ok("Manager account created successfully");
    }

    @Operation(
            summary = "Update manager profile",
            description = "Update the details of an existing manager account (admin only)."
    )
    //Admin update Manager details
    @PostMapping("/managers/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateManagerDetails
    (@PathVariable int id, @RequestBody @Valid ManagerUpdatePayload payload) {

        managerService.updateManagerDetails(id, payload);
        return ResponseEntity.ok("Manager profile updated successfully");
    }

    /*@Operation(
            summary = "Delete manager account",
            description = "Allows admin to delete a manager account from the system by ID."
    )
    //Admin delete Manager from system
    @DeleteMapping("/managers/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteManagerAccount(@PathVariable int id) {

        accountService.deleteConsultantById(id);
        return ResponseEntity.ok("Manager account deleted successfully");
    }*/
}
