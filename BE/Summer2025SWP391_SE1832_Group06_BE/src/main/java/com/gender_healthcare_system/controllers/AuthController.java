package com.gender_healthcare_system.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gender_healthcare_system.services.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Các API xác thực và quên mật khẩu")
@AllArgsConstructor
public class AuthController {
    private final EmailService emailService;

    @Operation(summary = "Quên mật khẩu", description = "Gửi email đặt lại mật khẩu cho người dùng")
    @PostMapping("/forgot-password/")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            System.out.println("Processing forgot password request for email: " + email);

            // Kiểm tra email có hợp lệ không
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email không được để trống");
            }

            // Kiểm tra format email
            if (!email.matches("^[a-zA-Z0-9._%+-]+@gmail\\.com$")) {
                return ResponseEntity.badRequest().body("Email phải là địa chỉ Gmail hợp lệ");
            }

            // Tạo link đặt lại mật khẩu (có thể thay đổi theo logic của bạn)
            String resetLink = "http://localhost:3000/reset-password?email=" + email + "&token=" + generateResetToken(); // thay đổi đường link cho phù hợp để test
            
            emailService.sendResetPasswordEmail(email, resetLink);
            System.out.println("Email sent successfully");

            return ResponseEntity.ok("Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.");
        } catch (Exception e) {
            System.err.println("Error in forgotPassword: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }

    // Tạo token đặt lại mật khẩu (có thể thay đổi theo logic của bạn)
    private String generateResetToken() {
        return java.util.UUID.randomUUID().toString();
    }
}
