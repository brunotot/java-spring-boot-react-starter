package com.brunotot.starter.app.country;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.brunotot.starter.common.SearchablePageable;
import com.brunotot.starter.config.SecurityExpressions;
import com.brunotot.starter.core.utils.RestUtils;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/country")
@Tag(name = "Country")
@PreAuthorize(SecurityExpressions.HAS_ROLE_SUPERADMIN)
public class CountryController {

    private final CountryService service;

    public CountryController(CountryService service) {
        this.service = service;
    }

    @GetMapping("/all")
    @PreAuthorize(SecurityExpressions.HAS_ROLE_USER_OR_SUPERADMIN)
    public List<CountryDTO> findAll() {
        SearchablePageable pageable = new SearchablePageable(Pageable.unpaged(), null);
        return this.service.findAll(pageable).toList();
    }

    @GetMapping
    @PreAuthorize(SecurityExpressions.HAS_ROLE_USER_OR_SUPERADMIN)
    public Page<CountryDTO> find(@RequestParam(defaultValue = "0", name = "page") int page,
            @RequestParam(defaultValue = "10", name = "rowsPerPage") int rowsPerPage,
            @RequestParam(defaultValue = "code", name = "sortBy") String sortBy,
            @RequestParam(defaultValue = "asc", name = "sortDirection") String sortDirection,
            @RequestParam(required = false, name = "searchText") String searchText) {
        SearchablePageable pageable = RestUtils.makePageable(page, rowsPerPage, sortBy, sortDirection, searchText);
        return this.service.findAll(pageable);
    }

    @PutMapping
    public CountryDTO update(@Valid @RequestBody CountryDTO countryDTO) {
        return this.service.update(countryDTO.getCode(), countryDTO);
    }
}