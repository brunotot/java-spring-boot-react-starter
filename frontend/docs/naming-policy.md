# Starter Frontend Naming Policy

## Goal

Keep names short, clear, and consistent while preserving strong app boundaries.

## Rule Set

1. Use `App` prefix only for app-shell and app-integration layers.
2. Do not use `App` prefix in feature-domain models, feature-local hooks, or feature-local components.
3. Use domain-first names in feature folders (`Country`, `CountryFilters`, `UserRole`).
4. Keep route/page shell names prefixed when they are app-level composition (`AppLayout`, `AppPage...`, `AppRouteGuard...`).
5. Keep app-level wrappers prefixed when they represent app opinions over shared infra (`AppThemeProvider`, `AppLocalizationProvider`).
6. Keep cross-app contracts prefixed only when they are intentionally exported beyond this app boundary.
7. Avoid constants with app prefixes inside feature modules (`DEFAULT_COUNTRY_FILTERS`, not `DEFAULT_LMS_COUNTRY_FILTERS`).
8. Avoid duplicate semantic prefixes (`AppCountryModel` in `features/country/...` is redundant).
9. Add a prefix only to resolve an actual collision, not preemptively.
10. Prefer renaming symbols before renaming folders/routes to reduce churn.

## Practical Layering

- Prefix expected:
  - `src/setup/layout/*`
  - `src/setup/route-guards/*`
  - `src/pages/*` (app page composition)
  - app-wide providers under `src/shared/providers/*` when app-specific
- Prefix not expected:
  - `src/features/**/models/*`
  - `src/features/**/components/*`
  - `src/features/**/hooks/*`
  - feature API contracts unless shared outside this app

## PR Checklist

- Does the name communicate domain meaning without folder context?
- Is a prefix present only because of real boundary/collision needs?
- Are app-shell names still clearly namespaced?
- Are feature-domain names concise and prefix-free?
