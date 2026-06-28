package com.brunotot.starter.config;

public final class SecurityExpressions {

    public static final String HAS_ROLE_SUPERADMIN = "hasRole('SUPERADMIN')";
    public static final String HAS_ROLE_USER_OR_SUPERADMIN = "hasAnyRole('USER', 'SUPERADMIN')";
    public static final String PERMIT_ALL = "permitAll()";

    private SecurityExpressions() {
    }
}