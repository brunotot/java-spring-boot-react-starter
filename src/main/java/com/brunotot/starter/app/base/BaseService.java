package com.brunotot.starter.app.base;

import java.lang.reflect.Field;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.brunotot.starter.common.SearchablePageable;
import com.brunotot.starter.core.utils.RestUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public abstract class BaseService<ID, DOMAIN, DTO> {
    protected final SearchableRepository<DOMAIN, ID> repository;
    protected final BaseMapper<DOMAIN, DTO> mapper;
    protected final List<String> searchableFields;

    /**
     * Constructor with searchable fields.
     */
    public BaseService(SearchableRepository<DOMAIN, ID> repository, BaseMapper<DOMAIN, DTO> mapper,
            List<String> searchableFields) {
        this.repository = repository;
        this.mapper = mapper;
        this.searchableFields = searchableFields != null ? searchableFields : Collections.emptyList();
    }

    /**
     * Constructor without searchable fields (empty list).
     */
    public BaseService(SearchableRepository<DOMAIN, ID> repository, BaseMapper<DOMAIN, DTO> mapper) {
        this(repository, mapper, Collections.emptyList());
    }

    public Page<DTO> findAll(SearchablePageable pageable) {
        if (pageable.hasSearchText()) {
            Page<DTO> searchResult = performSearch(pageable.getSearchText(), pageable.getPageable());
            if (searchResult != null) {
                return searchResult;
            }
        }
        return repository.findAll(pageable.getPageable()).map(mapper::toDto);
    }

    /**
     * Perform search using the repository's searchByKeywords method.
     * Returns null if no searchable fields are defined.
     */
    protected Page<DTO> performSearch(String searchText, Pageable pageable) {
        if (searchableFields.isEmpty()) {
            return null; // No searchable fields defined
        }
        return repository.searchByKeywords(searchText, pageable).map(mapper::toDto);
    }

    public DTO getById(ID id) {
        return mapper.toDto(repository.findById(id).orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id))));
    }

    @Transactional
    public DTO create(DTO dto) {
        DOMAIN domain = mapper.toDomain(dto);
        populateKeywords(domain);
        DTO newDto = mapper.toDto(repository.saveAndFlush(domain));

        return newDto;
    }

    @Transactional
    public DTO update(ID id, DTO dto) {
        DOMAIN domain = repository.findById(id)
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));

        mapper.update(dto, domain);
        populateKeywords(domain);
        DTO updatedDto = mapper.toDto(repository.saveAndFlush(domain));

        return updatedDto;
    }

    /**
     * Populate the keywords field from searchable fields.
     */
    private void populateKeywords(DOMAIN domain) {
        if (!(domain instanceof AuditableEntity)) {
            return;
        }

        if (searchableFields.isEmpty()) {
            return;
        }

        try {
            String keywords = searchableFields.stream()
                    .map(fieldName -> extractFieldValue(domain, fieldName))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.joining(" "));

            AuditableEntity auditableEntity = (AuditableEntity) domain;
            auditableEntity.setKeywords(keywords);
        } catch (Exception e) {
            log.warn("Failed to populate keywords for entity {}", domain.getClass().getSimpleName(), e);
        }
    }

    /**
     * Extract field value from domain object using reflection.
     */
    private Object extractFieldValue(DOMAIN domain, String fieldName) {
        try {
            Field field = domain.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(domain);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            log.debug("Could not extract field {} from {}", fieldName, domain.getClass().getSimpleName());
            return null;
        }
    }

    protected void publishEntityChange(String action, DTO dto) {
        // NOP
    }
}