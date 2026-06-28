# Frontend Coding Standards

## Feature Structure

Prefer this structure for new feature modules:

```text
src/features/{feature}/
  api/
  components/
  hooks/
  models/
  providers/
  signals/
```

Guidelines:

- Keep feature-specific API contracts, components, hooks, and models inside the feature folder.
- Use `providers/` and `signals/` only when the feature needs shared runtime state or context.
- Keep one canonical model file per domain entity. Do not duplicate schemas under alternate names.

## Validation And Translation Keys

Validation and UI messages should use predictable translation keys.

Recommended patterns:

- Common field labels: `common.messages.{field}`
- Feature page titles and actions: `{feature}.messages.{name}`
- Validation and capability errors: `{feature}.messages.{reason}`

Examples:

- `common.messages.tax`
- `country.messages.updateFailed`
- `country.messages.editDisabled`

## Shared Utilities

Before adding inline formatter or layout logic to a page:

- Reuse `src/shared/utils/dateFormatters.ts` for `Intl.DateTimeFormat` construction.
- Reuse `src/shared/utils/currencyFormatters.ts` for currency formatting helpers.
- Reuse `src/setup/theme/responsiveGrids.ts` for repeated grid template definitions.

## DRY Rule

When the same UI structure or formatting logic appears in more than one place, prefer extracting:

- a typed utility for pure formatting logic
- a theme/layout constant for repeated responsive structure
- a shared component only when markup and behavior repeat together
