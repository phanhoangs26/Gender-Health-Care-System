package com.gender_healthcare_system.controllers;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.gender_healthcare_system.dtos.login.LoginResponse;
import com.gender_healthcare_system.dtos.todo.*;
import com.gender_healthcare_system.dtos.user.ConsultantDTO;
import com.gender_healthcare_system.dtos.user.CustomerDTO;
import com.gender_healthcare_system.dtos.user.ManagerDTO;
import com.gender_healthcare_system.dtos.user.StaffDTO;
import com.gender_healthcare_system.entities.enu.AccountStatus;
import com.gender_healthcare_system.entities.user.AccountInfoDetails;
import com.gender_healthcare_system.payloads.login.LoginRequest;
import com.gender_healthcare_system.payloads.todo.*;
import com.gender_healthcare_system.payloads.user.ConsultantRegisterPayload;
import com.gender_healthcare_system.payloads.user.ManagerRegisterPayload;
import com.gender_healthcare_system.payloads.user.ManagerUpdatePayload;
import com.gender_healthcare_system.payloads.user.StaffRegisterPayload;
import com.gender_healthcare_system.payloads.user.StaffUpdatePayload;
import com.gender_healthcare_system.services.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.Map;

@Tag(name = "Customer Manager APIs", description = "APIs for managing customer-related functionalities) by managers")
@RestController
@RequestMapping("/api/v1/manager")
@AllArgsConstructor
public class ManagerController {

    private final ImageUploadService imageUploadService; //Cloudinary image upload service

    private final BlogService blogService;

    private final ManagerService managerService;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    private final AccountService accountService;

    private final StaffService staffService;

    private final CustomerService customerService;

    private final ConsultantService consultantService;

    private final TestingServiceTypeService testingServiceTypeService;

    private final TestingServiceResultService testingServiceResultService;

    private final TestingService_Service testingService_Service;

    @Operation(
            summary = "Manager registration",
            description = "Allows a manager to register a new account with the system."
    )
    //test
    //Manager registration
    @PostMapping("/register")
    public ResponseEntity<String> register
            (@RequestBody @Valid ManagerRegisterPayload payload) {
        accountService.createManagerAccount(payload);
        return ResponseEntity.ok("Manager registered successfully");
    }

    @Operation(
            summary = "Manager login",
            description = "Allows a manager to log in and receive a JWT token for authentication."
    )
    //Manager login
    @PostMapping("/login")
    public ResponseEntity<String> login
            (@RequestBody @Valid LoginRequest loginRequest) {
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
                        .getAuthority().equals("ROLE_MANAGER"));

        if (!hasRole) {
            throw new UsernameNotFoundException("Access denied for non-manager user");
        }

        AccountInfoDetails account = (AccountInfoDetails) authentication.getPrincipal();
        int id = account.getId();

        LoginResponse loginDetails = managerService.getManagerLoginDetails(id);
        //loginDetails.setUsername(loginRequest.getUsername());

        String jwtToken = jwtService.generateToken(id, loginRequest.getUsername(),
                account.getRolename(), loginDetails.getFullname(), loginDetails.getEmail());
        //loginDetails.setToken(jwtToken);
        return ResponseEntity.ok(jwtToken);

    }


    /// //////////////////////// Manage Blogs /////////////////////////////////////

    //comment
    //getAllBlogs
//    @GetMapping("/blogs/")
//    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
//    public ResponseEntity<Map<String, Object>> getAllBlogs
//    (@RequestParam(defaultValue = "0") int page,
//     @RequestParam(defaultValue = "blogId") String sort,
//     @RequestParam(defaultValue = "asc") String order) {
//
//        return ResponseEntity.ok(blogService.getAllBlogs(page, sort, order));
//    }
    @Operation(
            summary = "Get blog by ID for managers",
            description = "Retrieve a specific blog by its ID for Managers."
    )
    //move API to BlogController and rename it to getBlogByIDForManager
    //getBlogsById
    @GetMapping("/blogs/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<BlogDTO> getBlogByIdForManager(@PathVariable int id) {

        return ResponseEntity.ok(blogService.getBlogForManagerById(id));
    }

//    //searchBlogs
//    @GetMapping("/blogs/search")
//    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
//    public ResponseEntity<Map<String, Object>> searchBlogs
//    (@RequestParam String keyword,
//     @RequestParam(defaultValue = "0") int page,
//     @RequestParam(defaultValue = "blogId") String sort,
//     @RequestParam(defaultValue = "asc") String order) {
//        return ResponseEntity.ok(blogService.searchBlogs(keyword, page, sort, order));
//    }

    @Operation(
            summary = "Create blogs for managers",
            description = "Allows managers to create a new Blog with provided information."
    )
    //MANAGER CREATE BLOGS
    @PostMapping("/blogs/create")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> createBlog(@RequestBody @Valid BlogRegisterPayload payload) {

        blogService.createBlog(payload);
        return ResponseEntity.ok("Blog created successfully");
    }

    @Operation(
            summary = "Update blog by ID",
            description = "Allows managers to update an existing blog by its ID."
    )
    //MANGER UPDATE BLOGS
    @PutMapping("/blogs/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateBlog
            (@PathVariable int id, @RequestBody @Valid BlogUpdatePayload payload) {

        blogService.updateBlog(id, payload);
        return ResponseEntity.ok("Blog updated successfully");
    }

    @Operation(
            summary = "Delete blog by ID",
            description = "Allows managers to delete a blog by its ID."
    )
    //MANGER DELETE BLOGS
    @DeleteMapping("/blogs/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> deleteBlog(@PathVariable int id) {

        blogService.deleteBlog(id);
        return ResponseEntity.ok("Blog deleted successfully");
    }


    /// //////////////////////// Manage Consultants /////////////////////////////////////

    @Operation(
            summary = "Get all consultants",
            description = "Retrieve all consultants with pagination, sorting, and ordering options for managers."
    )
    //Manager get all Consultants
    @GetMapping("/consultants/")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAllConsultants
    (@RequestParam(defaultValue = "0") int page,
     @RequestParam(defaultValue = "accountId") String sort,
     @RequestParam(defaultValue = "asc") String order) {

        return ResponseEntity.ok(consultantService.getAllConsultants(page, sort, order));
    }

    @Operation(
            summary = "Get consultant details by ID",
            description = "Retrieve details of a specific consultant by their ID for managers."
    )
    //Manager get Consultant details by id
    @GetMapping("/consultants/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ConsultantDTO>
    getConsultantDetailsById(@PathVariable int id) {

        ConsultantDTO consultantDetails =
                consultantService.getConsultantDetailsForManager(id);
        if (consultantDetails != null) {
            return ResponseEntity.ok(consultantDetails);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Create new consultant account",
            description = "Allows managers to create a new consultant account with initial information."
    )
    //Manager create a new Consultant
    @PostMapping("/consultants/register")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> createConsultantAccount
            (@RequestBody @Valid ConsultantRegisterPayload payload) {

        accountService.createConsultantAccount(payload);
        return ResponseEntity.ok("Consultant account created successfully");
    }

    @Operation(
            summary = "Update consultant account status",
            description = "Allows managers to update the account status " +
                    "of an existing consultant account."
    )
    //Manager update Consultant status
    @PostMapping("/consultants/update_status/{consultantId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateConsultantStatus
            (@PathVariable int consultantId, @RequestParam AccountStatus status) {

        accountService.updateConsultantStatus(consultantId, status);
        return ResponseEntity.ok("Consultant account status updated successfully");
    }

    /*@Operation(
            summary = "Delete consultant account ",
            description = "Allows managers to update the details of an existing consultant account."
    )
    //Manager delete Consultant from system
    @DeleteMapping("/consultants/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> deleteConsultantAccount(@PathVariable int id) {

        accountService.deleteConsultantById(id);
        return ResponseEntity.ok("Consultant account deleted successfully");
    }*/


    /// //////////////////////// Manage Staffs /////////////////////////////////////

    @Operation(
            summary = "Get all staffs",
            description = "Retrieve all staff members with pagination, sorting, and ordering options for managers."
    )
    //Manager get all Staffs
    @GetMapping("/staffs/")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAllStaffs
    (@RequestParam(defaultValue = "0") int page,
     @RequestParam(defaultValue = "accountId") String sort,
     @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(staffService.getAllStaffs(page, sort, order));
    }

    @Operation(
            summary = "Get staff details by ID",
            description = "Retrieve details of a specific staff member by their ID for managers."
    )
    //Manager get staff details by id
    @GetMapping("/staffs/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<StaffDTO> getStaffById(@PathVariable int id) {
        StaffDTO staffDetails = staffService.getStaffById(id);
        if (staffDetails != null) {
            return ResponseEntity.ok(staffDetails);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Create new staff account",
            description = "Allows managers to create a new staff account with initial information."
    )
    //MANAGER CREATE STAFF ACCOUNT
    @PostMapping("/staffs/register")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> createStaffAccount
            (@RequestBody @Valid StaffRegisterPayload payload) {
        accountService.createStaffAccount(payload);
        return ResponseEntity.ok("Staff account created successfully");
    }

    @Operation(
            summary = "Update staff account details",
            description = "Allows managers to update the details of an existing staff account."
    )
    //Manager update Staff infos
    @PutMapping("/staffs/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateStaffAccount
            (@PathVariable int id, @RequestBody @Valid StaffUpdatePayload payload) {

        staffService.updateStaffAccount(id, payload);
        return ResponseEntity.ok("Staff details updated successfully");
    }

    /*@Operation(
            summary = "Delete staff account",
            description = "Allows managers to delete a staff account from the system by ID."
    )
    //Manager delete staff from system
    @DeleteMapping("/staffs/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> deleteStaffAccount(@PathVariable int id) {

        accountService.deleteStaffById(id);
        return ResponseEntity.ok("Staff account deleted successfully");
    }*/


    /// //////////////////////// Manage Customer /////////////////////////////////////

    @Operation(
            summary = "Get all customers",
            description = "Retrieve all customers with pagination, sorting, and ordering options for managers."
    )
    //Get all Customers
    @GetMapping("/customers/")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAllCustomers
    (@RequestParam(defaultValue = "0") int page,
     @RequestParam(defaultValue = "accountId") String sort,
     @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(customerService.getAllCustomers(page, sort, order));
    }

    @Operation(
            summary = "Get customer details by ID",
            description = "Retrieve details of a specific customer by their ID for managers."
    )
    //Get customer details by id
    @GetMapping("/customers/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<CustomerDTO> getCustomerById
            (@PathVariable int id) throws JsonProcessingException {

        return ResponseEntity.ok(customerService.getCustomerForManagerById(id));

    }

    @Operation(
            summary = "Update customer account status",
            description = "Allows managers to update the status of an existing customer account."
    )
    @PostMapping("/customers/update_status/{customerId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateCustomerStatus
            (@PathVariable int customerId, @RequestParam AccountStatus status) {
        accountService.updateCustomerStatus(customerId, status);
        return ResponseEntity.ok("Customer account status updated successfully");
    }

    /*@Operation(
            summary = "Delete customer account",
            description = "Allows managers to delete a customer account from the system by ID."
    )
    @DeleteMapping("/customers/delete/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> deleteCustomerAccount(@PathVariable int id) {
        accountService.deleteCustomerById(id);
        return ResponseEntity.ok("Customer account deleted successfully");
    }*/

    /// //////////////////////// Manage Testing Service Type /////////////////////////////////////

    @Operation(
            summary = "Get testing service type by ID",
            description = "Retrieve a specific testing service type by its ID for managers."
    )
    //get testing service type by ID
    @GetMapping("/testing-service-types/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<TestingServiceTypeDetailsDTO>
    getTestingServiceTypeById(@PathVariable int id) {

        return ResponseEntity.ok(testingServiceTypeService.getTestingServiceTypeById(id));
    }

    @Operation(
            summary = "Get all testing service types",
            description = "Retrieve all testing service types with pagination, sorting, and ordering options for managers."
    )
    //get all testing service types
    @GetMapping("/testing-services-types/")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAllTestingServiceTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "serviceTypeId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(testingServiceTypeService.getAllTestingServiceTypes(page, sort, order));
    }

    @Operation(
            summary = "Create new testing service type",
            description = "Allows managers to create a new testing service type with initial information."
    )
    //create new testing service type
    @PostMapping("/testing-services-types/create")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> createTestingServiceType(
            @RequestBody @Valid TestingServiceTypeRegisterPayload payload) {
        testingServiceTypeService.createTestingServiceType(payload);
        return ResponseEntity.ok("Testing Service type created successfully");
    }

    @Operation(
            summary = "Update testing service type",
            description = "Allows managers to update an existing testing service type by its ID."
    )
    //update testing service type
    @PutMapping("/testing-services-types/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> updateTestingServiceType(
            @PathVariable int id,
            @RequestBody @Valid TestingServiceTypeUpdatePayload payload) {
        testingServiceTypeService.updateTestingServiceType(id, payload);
        return ResponseEntity.ok("Testing Service type updated successfully");
    }

    @Operation(
            summary = "Delete testing service type",
            description = "Allows managers to delete a testing service type by its ID."
    )
    //delete testing service type
    @DeleteMapping("/testing-services-types/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> deleteTestingServiceType(@PathVariable int id) {
        testingService_Service.deleteTestingService(id);
        return ResponseEntity.ok("Testing Service type deleted successfully");
    }


    /// //////////////////////// Manage Testing Service Results /////////////////////////////////////


    /*//update testing service result
    @PutMapping("/testing-services-results/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> updateTestingServiceResult(
            @PathVariable int id, @RequestBody TestingServiceResultPayload payload) {
        testingServiceResultService.updateTestingServiceResult(id, payload);
        return ResponseEntity.ok("Testing Service result updated successfully");
    }*/
    @Operation(
            summary = "Delete testing service result",
            description = "Allows managers to delete a testing service result by its ID."
    )
    @DeleteMapping("/testing-services-results/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> deleteTestingServiceResult(@PathVariable int id) {
        testingService_Service.deleteTestingService(id);
        return ResponseEntity.ok("Testing Service result deleted successfully");
    }


    /// //////////////////////// Manage Testing Services /////////////////////////////////////

    @Operation(
            summary = "Get testing service by ID",
            description = "Retrieve a specific testing service by its ID for managers."
    )
    //get testing service by ID
    @GetMapping("/testing-services/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<TestingServiceDTO> getTestingServiceById(@PathVariable int id) {
        return ResponseEntity.ok(testingService_Service.getTestingServiceById(id));
    }

    @Operation(
            summary = "Get all testing services",
            description = "Retrieve all testing services with pagination, sorting, and ordering options for managers."
    )
    //get all testing services
    @GetMapping("/testing-services/")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAllTestingServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "serviceId") String sort,
            @RequestParam(defaultValue = "asc") String order) {
        return ResponseEntity.ok(testingService_Service.getAllTestingServices(page, sort, order));
    }

    @Operation(
            summary = "Create new testing service",
            description = "Allows managers to create a new testing service with initial information."
    )
    //create new testing service
    @PostMapping("/testing-services/create")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> createTestingService(
            @RequestBody @Valid TestingServiceRegisterPayload payload) {
        testingService_Service.createTestingService(payload);
        return ResponseEntity.ok("Testing Service created successfully");
    }

    /*@Operation(
            summary = "Create new price list for existing testing service",
            description = "Allows managers to create a new price list for an existing testing service."
    )
    //Create new price list for existing testing service
    @PostMapping("/testing-services/price-lists/create/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public void createTestingServicePriceList(
            @PathVariable int id,
            @RequestBody @Valid PriceListRegisterPayload payload) {
        priceListService.createNewPriceListForExistingService(id, payload);
    }*/

    @Operation(
            summary = "Update testing service",
            description = "Allows managers to update an existing testing service by its ID."
    )
    //update testing service
    @PutMapping("/testing-services/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> updateTestingService(
            @PathVariable int id,
            @RequestBody @Valid TestingServiceUpdatePayload payload) {
        testingService_Service.updateTestingService(id, payload);
        return ResponseEntity.ok("Testing Service updated successfully");
    }

    @Operation(
            summary = "Delete testing service",
            description = "Allows managers to delete a testing service by its ID."
    )
    //delete testing service
    @DeleteMapping("/testing-services/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<String> deleteTestingService(@PathVariable int id) {
        testingService_Service.deleteTestingService(id);
        return ResponseEntity.ok("Testing Service deleted successfully");
    }


    /// //////////////////////////// Price List Operations ///////////////////////////////

    /*@Operation(
            summary = "Get price list by ID",
            description = "Retrieve a specific price list by its ID for managers."
    )
    //update price list by ID
    @PutMapping("/price-lists/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public void updatePriceList(@PathVariable int id,
                                @RequestBody @Valid PriceListUpdatePayload payload) {
        priceListService.updatePriceList(id, payload);
    }*/

    /*@Operation(
            summary = "Get all price lists for a testing service",
            description = "Retrieve all price lists for a specific testing service with pagination, sorting, and ordering options."
    )
    //delete price list by ID
    @DeleteMapping("/price-lists/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")

    public void deletePriceList(@PathVariable int id) {
        priceListService.deletePriceList(id);
    }*/


    /// //////////////////////// API UPLOAD IMAGE /////////////////////////////////////
    private final Cloudinary cloudinary;

    @Operation(
            summary = "Upload image",
            description = "Allows managers to upload an image to a specified folder."
    )
    @PostMapping(value = "/image/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ImageUploadDTO> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) throws IOException {
        return ResponseEntity.ok(imageUploadService.uploadImage(file, folder));
    }

    @Operation(
            summary = "Replace image",
            description = "Allows managers to replace an existing image in a specified folder."
    )
    @PutMapping(value = "/image/replace", consumes = "multipart/form-data")
    public ResponseEntity<ImageUploadDTO> replaceImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder,
            @RequestParam("id") String publicId) throws IOException {

        return ResponseEntity.ok(imageUploadService.replaceImage(file, folder, publicId));
    }

    @Operation(
            summary = "Delete image",
            description = "Allows managers to delete an image by its public ID."
    )
    @DeleteMapping("/image/delete")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> deleteImage(
            @RequestParam("id") String publicId) throws IOException {

        boolean isDelete = imageUploadService.deleteImage(publicId);
        return isDelete ? ResponseEntity.ok("Deleted") :
                ResponseEntity.status(404).body("Not found");
    }

    @Operation(
            summary = "Get my Manager Profile",
            description = "Manager lấy thông tin profile của chính mình (id lấy từ token)"
    )
    @GetMapping("/profile/my")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ManagerDTO> getMyManagerProfile(
            @AuthenticationPrincipal AccountInfoDetails account) {
        int managerId = account.getId();
        return ResponseEntity.ok(managerService.getManagerDetailsById(managerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found")));
    }

    @Operation(
            summary = "Update my Manager Profile",
            description = "Manager cập nhật profile của chính mình (id lấy từ token)"
    )
    @PutMapping("/profile/update/my")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateMyManagerProfile(
            @AuthenticationPrincipal AccountInfoDetails account,
            @RequestBody @Valid ManagerUpdatePayload payload) {
        int managerId = account.getId();
        managerService.updateManagerById(managerId, payload);
        return ResponseEntity.ok("Manager profile updated successfully");
    }

    // API cũ, kiểm tra bảo mật
    @Operation(
            summary = "Get Manager Profile by ID (bảo mật)",
            description = "Manager chỉ được xem profile của chính mình, nếu truyền id khác sẽ bị cấm."
    )
    @GetMapping("/profile/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ManagerDTO> getManagerProfileById(
            @PathVariable int id,
            @AuthenticationPrincipal AccountInfoDetails account) {
        if (id != account.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu này!");
        }
        return ResponseEntity.ok(managerService.getManagerDetailsById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found")));
    }

    @Operation(
            summary = "Update Manager Profile by ID (bảo mật)",
            description = "Manager chỉ được cập nhật profile của chính mình, nếu truyền id khác sẽ bị cấm."
    )
    @PutMapping("/profile/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateManagerProfileById(
            @PathVariable int id,
            @AuthenticationPrincipal AccountInfoDetails account,
            @RequestBody @Valid ManagerUpdatePayload payload) {
        if (id != account.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật dữ liệu này!");
        }
        managerService.updateManagerById(id, payload);
        return ResponseEntity.ok("Manager profile updated successfully");
    }

}

