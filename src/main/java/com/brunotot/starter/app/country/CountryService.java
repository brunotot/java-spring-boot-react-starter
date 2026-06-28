package com.brunotot.starter.app.country;

import java.util.Arrays;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brunotot.starter.app.base.BaseService;
import com.brunotot.starter.core.utils.RestUtils;

@Service
public class CountryService extends BaseService<String, Country, CountryDTO> {

    public CountryService(CountryRepository repository, CountryMapper mapper) {
        super(repository, mapper, Arrays.asList("code", "tax"));
    }

    @Override
    @Transactional
    public CountryDTO update(String code, CountryDTO dto) {
        if (code == null || code.isBlank()) {
            throw RestUtils.badRequest("Country code is required");
        }

        Country country = repository.findById(code)
                .orElseThrow(() -> RestUtils.notFound("code", code));

        country.setTax(dto.getTax());
        country.setKeywords(country.getCode() + " " + country.getTax());

        return mapper.toDto(repository.saveAndFlush(country));
    }
}