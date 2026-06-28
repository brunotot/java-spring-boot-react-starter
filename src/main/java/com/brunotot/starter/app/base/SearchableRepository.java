package com.brunotot.starter.app.base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

@NoRepositoryBean
public interface SearchableRepository<DOMAIN, ID> extends JpaRepository<DOMAIN, ID> {

    @Query("SELECT e FROM #{#entityName} e WHERE LOWER(e.keywords) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    Page<DOMAIN> searchByKeywords(@Param("searchText") String searchText, Pageable pageable);
}
