package com.brunotot.starter.config;

import java.io.IOException;
import java.time.Instant;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import com.brunotot.starter.app.auth.LthUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/auth/login",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui.html",
                                                                "/swagger-ui/**")
                                                .permitAll()
                                                .requestMatchers("/api/**").authenticated()
                                                .anyRequest().permitAll())
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)
                                .exceptionHandling(exceptionHandling -> exceptionHandling
                                                .authenticationEntryPoint((request, response,
                                                                authException) -> writeError(response,
                                                                                HttpServletResponse.SC_UNAUTHORIZED,
                                                                                "Unauthorized"))
                                                .accessDeniedHandler((request, response,
                                                                accessDeniedException) -> writeError(response,
                                                                                HttpServletResponse.SC_FORBIDDEN,
                                                                                "Forbidden")))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                                .csrf(csrf -> csrf.ignoringRequestMatchers(
                                                "/api/**",
                                                "/v3/api-docs/**",
                                                "/swagger-ui.html",
                                                "/swagger-ui/**"));

                return http.build();
        }

        private void writeError(HttpServletResponse response, int status, String message) throws IOException {
                response.setStatus(status);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding(java.nio.charset.StandardCharsets.UTF_8.name());
                ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
                objectMapper.writeValue(response.getWriter(), new ApiError(status, message, null, Instant.now()));
        }

        @Bean
        AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }

        @Bean
        UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
                UserDetails demoUser = new LthUserDetails(
                                org.springframework.security.core.userdetails.User.withUsername("demo")
                                                .password(passwordEncoder.encode("demo123"))
                                                .roles("USER")
                                                .build());
                UserDetails superAdminUser = new LthUserDetails(
                                org.springframework.security.core.userdetails.User.withUsername("superadmin")
                                                .password(passwordEncoder.encode("superadmin123"))
                                                .roles("SUPERADMIN")
                                                .build());

                return new InMemoryUserDetailsManager(demoUser, superAdminUser);
        }

        @Bean
        PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
