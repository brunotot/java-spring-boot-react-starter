package com.brunotot.starter.app.auth;

import java.util.Collection;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class LthUserDetails implements UserDetails {

    public static final String ROLE_SUPERADMIN = "ROLE_SUPERADMIN";
    public static final String ROLE_USER = "ROLE_USER";

    private final UserDetails originalUserDetails;

    public LthUserDetails(UserDetails originalUserDetails) {
        this.originalUserDetails = Objects.requireNonNull(originalUserDetails, "originalUserDetails must not be null");
    }

    public UserDetails getOriginalUserDetails() {
        return originalUserDetails;
    }

    public LmsUserRole getRole() {
        return resolveRole(originalUserDetails.getAuthorities());
    }

    public static LmsUserRole resolveRole(Collection<? extends GrantedAuthority> authorities) {
        boolean hasSuperAdminRole = authorities.stream()
                .anyMatch(authority -> ROLE_SUPERADMIN.equals(authority.getAuthority()));
        if (hasSuperAdminRole) {
            return LmsUserRole.SUPERADMIN;
        }

        boolean hasUserRole = authorities.stream()
                .anyMatch(authority -> ROLE_USER.equals(authority.getAuthority()));
        if (hasUserRole) {
            return LmsUserRole.USER;
        }

        throw new IllegalStateException("User has no supported role");
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return originalUserDetails.getAuthorities();
    }

    @Override
    public String getPassword() {
        return originalUserDetails.getPassword();
    }

    @Override
    public String getUsername() {
        return originalUserDetails.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return originalUserDetails.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return originalUserDetails.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return originalUserDetails.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return originalUserDetails.isEnabled();
    }

    @Override
    public String toString() {
        return "LthUserDetails[username=" + getUsername() + "]";
    }
}