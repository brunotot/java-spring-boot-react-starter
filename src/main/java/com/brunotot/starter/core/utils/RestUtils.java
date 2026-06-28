package com.brunotot.starter.core.utils;

import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.brunotot.starter.app.auth.LthUserDetails;
import com.brunotot.starter.common.SearchablePageable;

public class RestUtils {
    public static ResponseStatusException notFound(String param, String value) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity with " + param + "=" + value + " not found");
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }

    public static ResponseStatusException unauthorized(String message) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ResponseStatusException internalServerError(String message) {
        return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }

    public static ResponseStatusException notImplemented(String message) {
        return new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, message);
    }

    public static SearchablePageable makePageable(int page, int rowsPerPage, String sortBy, String sortDirection,
            String searchText) {
        Sort sort = "desc".equals(sortDirection) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, rowsPerPage < 0 ? Integer.MAX_VALUE : rowsPerPage, sort);
        return new SearchablePageable(pageable, searchText);
    }

    public static Optional<LthUserDetails> getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && (authentication.getPrincipal() instanceof LthUserDetails))
            return Optional.of((LthUserDetails) authentication.getPrincipal());
        else
            return Optional.empty();
    }

}
