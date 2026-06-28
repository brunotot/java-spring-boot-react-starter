package com.brunotot.starter.app.country;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.brunotot.starter.app.base.BaseMapper;
import com.brunotot.starter.app.base.JsonNullableMapper;

@Mapper(uses = JsonNullableMapper.class, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = "spring")
public interface CountryMapper extends BaseMapper<Country, CountryDTO> {

    @Override
    @Mapping(target = "code", source = "code")
    Country toDomain(CountryDTO dto);

    @Override
    @Mapping(target = "code", source = "code")
    CountryDTO toDto(Country domain);

    @Override
    @Mapping(target = "code", source = "code")
    void update(CountryDTO update, @MappingTarget Country destination);
}