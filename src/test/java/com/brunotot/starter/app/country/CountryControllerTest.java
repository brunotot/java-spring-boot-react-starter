package com.brunotot.starter.app.country;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("CountryControllerIntegrationTests")
class CountryControllerTest {

    private static final String API_BASE_URL = "/api/country";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CountryRepository countryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Returns paged countries for user")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithUserRole_ReturnsOk() throws Exception {
        mockMvc.perform(get(API_BASE_URL)
                .queryParam("page", "0")
                .queryParam("rowsPerPage", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + "/all" + " - Returns all countries for user")
    @WithMockUser(username = "demo", roles = "USER")
    void findAll_WithUserRole_ReturnsOkAndArray() throws Exception {
        mockMvc.perform(get(API_BASE_URL + "/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + " - Returns forbidden for user")
    @WithMockUser(username = "demo", roles = "USER")
    void update_WithUserRole_ReturnsForbidden() throws Exception {
        Country countryBefore = countryRepository.findById("PT").orElseThrow();
        double taxBefore = countryBefore.getTax();

        CountryDTO payload = new CountryDTO("PT", taxBefore + 1.0);

        mockMvc.perform(put(API_BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Forbidden"));

        Country countryAfter = countryRepository.findById("PT").orElseThrow();
        assertEquals(taxBefore, countryAfter.getTax());
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + " - Updates tax and keywords for superadmin")
    @WithMockUser(username = "superadmin", roles = "SUPERADMIN")
    void update_WithSuperAdminRole_UpdatesTaxAndKeywords() throws Exception {
        CountryDTO payload = new CountryDTO("PT", 26.2);

        mockMvc.perform(put(API_BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("PT"))
                .andExpect(jsonPath("$.tax").value(26.2));

        Country updated = countryRepository.findById("PT").orElseThrow();
        assertEquals(26.2, updated.getTax());
        assertEquals("PT 26.2", updated.getKeywords());
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + " - Returns not found for unknown country code")
    @WithMockUser(username = "superadmin", roles = "SUPERADMIN")
    void update_UnknownCode_WithSuperAdminRole_ReturnsNotFound() throws Exception {
        String unknownCode = "NOT-EXISTS-" + System.nanoTime();
        CountryDTO payload = new CountryDTO(unknownCode, 11.0);

        mockMvc.perform(put(API_BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + " - Returns bad request when mandatory fields are missing")
    @WithMockUser(username = "superadmin", roles = "SUPERADMIN")
    void update_MissingMandatoryFields_WithSuperAdminRole_ReturnsBadRequest() throws Exception {
        CountryDTO payload = new CountryDTO(null, null);

        mockMvc.perform(put(API_BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Bad request"))
                .andExpect(jsonPath("$.errors.code").exists())
                .andExpect(jsonPath("$.errors.tax").exists());
    }
}
