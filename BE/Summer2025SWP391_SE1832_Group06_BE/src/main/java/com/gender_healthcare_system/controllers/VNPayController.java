package com.gender_healthcare_system.controllers;

import com.gender_healthcare_system.services.VNPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "VNPay APIs", description = "APIs for accessing VNPay gateway functionalities")
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/vnpay/payment-transaction")
class VNPayController {

    private final VNPayService vnPayService;

    @Operation(
            summary = "Create a VNPay payment request URL",
            description = "Allow Customers to create a VNPay Payment Request URL " +
                    "after providing initial parameters."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "VNPay payment request URL " +
                    "created successfully")
    })
    @PostMapping("/create-payment-url")
    public ResponseEntity<String> createVNPayPaymentUrl(
            @RequestParam
            @Min(value = 10000, message = "Amount must be at least 10 000 VND")
            @Max(value = 20000000, message = "Amount cannot exceed 20 000 000 VND")
            Long amount,
            @RequestParam(defaultValue = "http://localhost:8080/api/v1/vnpay/" +
                    "payment-transaction/check-payment-error")
            @Length(min = 5, max = 255, message = "Redirect URL " +
                    "must be between 5 and 255 characters")
            String redirectUrl,
            HttpServletRequest request){

        return ResponseEntity.ok
                (vnPayService.createPaymentUrl(amount, redirectUrl, request));
    }

    @Operation(
            summary = "Check transaction status of a VNPay Payment transaction",
            description = "Allow Customers to check whether a VNPay Payment transaction " +
                    "was successful or not after providing initial parameters."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "VNPay payment transaction " +
                    "was successful")
    })
    @GetMapping("/check-payment-error")
    public ResponseEntity<String> checkPaymentErrorCode(
            @RequestParam String transactionNo,
            @RequestParam String responseCode,
            @RequestParam String transactionStatus){
            //HttpServletRequest request){

        return ResponseEntity.ok(
                vnPayService.checkPaymentError(transactionNo, responseCode, transactionStatus));
    }
}
