package com.brunotot.starter.app.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthControllerIntegrationTests")
class AuthControllerTest {

    private static final String API_BASE_URL = "/api/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login - Authenticates demo user and allows /me with USER role")
    void login_DemoUser_ReturnsOkAndEnablesMe() throws Exception {
        String payload = objectMapper.writeValueAsString(new AuthController.LoginRequest("demo", "demo123"));

        MvcResult loginResult = mockMvc.perform(post(API_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("demo"))
                .andExpect(jsonPath("$.message").value("Authenticated"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(get(API_BASE_URL + "/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("demo"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Authenticates superadmin and returns SUPERADMIN role in /me")
    void login_Superadmin_ReturnsOkAndMeRole() throws Exception {
        String payload = objectMapper
                .writeValueAsString(new AuthController.LoginRequest("superadmin", "superadmin123"));

        MvcResult loginResult = mockMvc.perform(post(API_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("superadmin"))
                .andExpect(jsonPath("$.message").value("Authenticated"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(get(API_BASE_URL + "/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("superadmin"))
                .andExpect(jsonPath("$.role").value("SUPERADMIN"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Returns unauthorized for invalid credentials")
    void login_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        String payload = objectMapper.writeValueAsString(new AuthController.LoginRequest("demo", "wrong-password"));

        mockMvc.perform(post(API_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }

    @Test
    @DisplayName("POST /api/auth/logout - Invalidates session and blocks /me afterwards")
    void logout_AfterLogin_InvalidatesSession() throws Exception {
        String payload = objectMapper.writeValueAsString(new AuthController.LoginRequest("demo", "demo123"));

        MvcResult loginResult = mockMvc.perform(post(API_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(post(API_BASE_URL + "/logout").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out"));

        mockMvc.perform(get(API_BASE_URL + "/me").session(session))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }
}
