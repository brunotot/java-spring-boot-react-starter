package com.brunotot.starter.app.base;

import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

public interface BaseMapper<DOMAIN, DTO> {

    @Mapping(target = "id", ignore = true)
    DOMAIN toDomain(DTO dto);

    DTO toDto(DOMAIN lock);

    @InheritConfiguration
    void update(DTO update, @MappingTarget DOMAIN destination);
}
