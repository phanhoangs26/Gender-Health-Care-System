package com.gender_healthcare_system.configs;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.gender_healthcare_system.filters.JwtAuthFilter;

import lombok.AllArgsConstructor;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final UserDetailsService userDetailsService;

        // Các API không cần đăng nhập
        private static final String[] AUTH_WHITELIST = {
                        "/api/v1/customer/register",
                        "/api/v1/customer/login",
                        "/api/v1/admin/login",
                        "/api/v1/manager/login",
                        "/api/v1/staff/login",
                        "/api/v1/consultant/login",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/api/v1/admin/statistic-reports/**", // để tạm API báo cáo ở đây để test
                        "/api/v1/vnpay/payment-transaction/**", // để tạm API báo cáo ở đây để test
                        "/api/v1/auth/forgot-password/" // Cho phép quên mật khẩu public
        };

        // Các API blog công khai (xem, tìm kiếm)
        private static final String[] BLOG_PUBLIC_ENDPOINTS = {
                        "/api/v1/blogs/public/**"
        };

        private static final String[] BLOG_COMMENT_3_ROLES_ENDPOINTS = {
                        "/api/v1/blogs/comments/blogId/{blogId}",
                        "/api/v1/blogs/comments/commentId/{commentId}/subComments",

        };

        private static final String[] BLOG_COMMENT_2_ROLES_ENDPOINTS = {
                        "/api/v1/blogs/comments/blogId/{blogId}/create",
                        "/api/v1/blogs/comments/commentId/{commentId}/create-subComment",
                        "/api/v1/blogs/comments/commentId/{commentId}/edit",

        };

        // Các API cần quyền CUSTOMER
        private static final String[] CUSTOMER_AUTHLIST = {
                        "/api/v1/customer/profile/**",
                        "/api/v1/customer/consultations/**",
                        "/api/v1/customer/testing-service-bookings/**",
                        "/api/v1/customer/consultant-list/**",
                        "/api/v1/customer/payment-transaction/**",
                        "/api/v1/customer/testing-services/**",
                        "/api/v1/customer/female/**",
                        "/api/v1/customer/menstrual-cycles/**",
                        "/api/v1/customer/symptoms/**",
                        "/api/v1/customer/age-info/**"
        };

        // Các API cần quyền ADMIN
        private static final String[] ADMIN_AUTHLIST = {
                        "/api/v1/admin/managers/**"
        };

        // Các API cần quyền MANAGER
        private static final String[] MANAGER_AUTHLIST = {
                        "/api/v1/manager/blogs/**",
                        "/api/v1/manager/staffs/**",
                        "/api/v1/manager/consultants/**",
                        "/api/v1/manager/customers/**",
                        "/api/v1/manager/testing-service-types/**",
                        "/api/v1/manager/testing-service-results/**",
                        "/api/v1/manager/testing-services/**",
                        "/api/v1/manager/testing-service-forms/**",
                        "/api/v1/manager/price-lists/**",
                        "/api/v1/manager/image/**",
                        "/api/v1/blogs/comments/commentId/{commentId}/remove",
                        "/api/v1/customer/perimenopausal-customers",
                        "/api/v1/customer/customers-by-age-range"
        };

        // Các API cần quyền STAFF
        private static final String[] STAFF_AUTHLIST = {
                        "/api/v1/staff/payments/**",
                        "/api/v1/staff/testing-service-bookings/**"
        };

        // Các API cần quyền CONSULTANT
        private static final String[] CONSULTANT_AUTHLIST = {
                        "/api/v1/consultant/consultations/**",
                        "/api/v1/consultant/profile/**",
                        "/api/v1/consultant/certificates/**"
        };

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // cấu hình CORS
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(AUTH_WHITELIST).permitAll()
                                                .requestMatchers(BLOG_PUBLIC_ENDPOINTS).permitAll()
                                                .requestMatchers("/api/chat/**").authenticated() // chỉ cần đăng nhập là
                                                                                                 // chat dc
                                                .requestMatchers(ADMIN_AUTHLIST).hasAuthority("ROLE_ADMIN")
                                                .requestMatchers(MANAGER_AUTHLIST).hasAuthority("ROLE_MANAGER")
                                                .requestMatchers(STAFF_AUTHLIST).hasAuthority("ROLE_STAFF")
                                                .requestMatchers(CONSULTANT_AUTHLIST).hasAuthority("ROLE_CONSULTANT")
                                                .requestMatchers(CUSTOMER_AUTHLIST).hasAuthority("ROLE_CUSTOMER")
                                                .requestMatchers(BLOG_COMMENT_3_ROLES_ENDPOINTS)
                                                .hasAnyAuthority("ROLE_MANAGER", "ROLE_CUSTOMER",
                                                                "ROLE_CONSULTANT")
                                                .requestMatchers(BLOG_COMMENT_2_ROLES_ENDPOINTS)
                                                .hasAnyAuthority("ROLE_CUSTOMER", "ROLE_CONSULTANT")
                                                .anyRequest().authenticated())
                                .sessionManagement(sess -> sess
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .build();
        }

        // thêm phần này để cấu hình CORS cho FE
        // Cấu hình cho phép các request CORS từ FE
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(List.of("*")); // Use allowedOriginPatterns instead of
                                                                      // allowedOrigins
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true); // cho phép gửi cookie hoặc token từ FE

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public BCryptPasswordEncoder bCryptPasswordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
                provider.setPasswordEncoder(bCryptPasswordEncoder());
                return provider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}
