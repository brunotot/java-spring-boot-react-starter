# Starter Template

Spring Boot starter template focused on practical enterprise defaults: layered architecture, Flyway-managed schema, session-based auth, method-level authorization, searchable entities, and full controller integration testing.

## Architecture And Infrastructure Decisions

### 1) Runtime platform and build

- Java 21 is the baseline runtime and toolchain.
- Gradle is the build system with Spring dependency management.
- Rationale: modern LTS runtime, fast incremental builds, and predictable dependency alignment.

### 2) Web/API stack

- Spring Boot Web MVC is used for synchronous REST APIs.
- OpenAPI/Swagger UI is enabled for API discovery and manual testing.
- Rationale: simple, familiar HTTP stack with first-class Spring ecosystem support.

### 3) Persistence and database strategy

- Spring Data JPA is used for repository abstractions.
- Flyway is the single source of truth for schema and seed evolution.
- PostgreSQL is the default runtime database.
- H2 remains available as runtime dependency for lightweight scenarios.
- Rationale: database changes are explicit, versioned, and reproducible across environments.

### 4) Migration policy

- Migrations are additive and immutable once applied.
- Current migrations include:
  - country table creation + ISO seed data
  - searchable keywords column
  - keyword backfill for seeded records
- Rationale: safe production rollout and traceable data model evolution.

### 5) Layered architecture

- Controller -> Service -> Repository -> Entity/DTO/Mapper.
- MapStruct is used for mapping between DTO and domain objects.
- Lombok is used to reduce boilerplate.
- Rationale: clear separation of concerns and maintainable domain/API boundaries.

### 6) Base service abstraction

- Shared CRUD/search behavior lives in a generic base service.
- Searchable fields are constructor-injected into services.
- Search is routed through a searchable pageable wrapper and repository keyword query.
- Rationale: remove duplicated logic and enforce consistent patterns across modules.

### 7) Search model

- Search uses a denormalized keywords column on auditable entities.
- Keywords are populated/updated from configured searchable fields during writes.
- Repository-level keyword search is reusable via a searchable repository base interface.
- Rationale: simple, predictable, and performant enough for template-level filtering use cases.

### 8) Auditing model

- JPA auditing is enabled globally.
- createdAt/modifiedAt and createdBy/modifiedBy are auto-managed.
- Auditor falls back to system when principal is unavailable.
- Rationale: built-in record traceability with minimal per-entity code.

### 9) Security model

- Session-based authentication with login/logout endpoints.
- HTTP basic and form login are disabled.
- Method security is enabled and used as the main authorization mechanism.
- Security expression constants are centralized for reuse.
- Controller-level default is superadmin, with endpoint overrides where user access is allowed.
- Rationale: secure-by-default posture with explicit per-endpoint authorization intent.

### 10) Error handling model

- Global exception handler returns structured API error responses.
- ResponseStatusException preserves its HTTP status in responses.
- Rationale: stable and client-friendly error payloads with proper status semantics.

### 11) Country module policy

- Country update endpoint is payload-based PUT.
- Both DTO fields are mandatory for update payload.
- Unknown country codes return not found.
- Update authorization requires superadmin.
- Read endpoints are allowed for user and superadmin.
- Rationale: strict write path with predictable business and security behavior.

### 12) JSON serialization

- ObjectMapper is configured centrally (JsonConfig).
- Java time and JsonNullable modules are registered.
- Rationale: consistent serialization behavior across runtime and tests.

### 13) Testing strategy

- JUnit 5 as test framework.
- Spring Boot integration tests with MockMvc for controller-level behavior.
- Security in tests is handled with WithMockUser annotations.
- Transactional integration tests with active test profile.
- DisplayName conventions are used for clear console/report output.
- Rationale: high-confidence endpoint verification with realistic application wiring.

### 14) Test output ergonomics

- Gradle test-logger plugin is enabled for cleaner pass/fail output.
- Test JVM uses Xshare off to suppress class sharing noise.
- Test profile logging is reduced to WARN to keep output focused on test results.
- Rationale: developer-friendly feedback loop during local test runs.

## Local Runtime Configuration

Default runtime properties target local PostgreSQL.

Expected local database setup:

- Database: leather_proizvodnja
- User: leather_proizvodnja
- Password: kistibojice

## Prerequisites

- Java 21
- PostgreSQL running locally (for default app runtime)
- Docker optional (if used for future testcontainers-based flows)

## Run The Application

```bash
./gradlew bootRun --console=plain
```

## Testing

### Run all tests

```bash
./gradlew test
```

### Re-run all tests from scratch

```bash
./gradlew test --rerun-tasks
```

### Run a single test class

```bash
./gradlew test --tests "com.brunotot.starter.app.country.CountryControllerTest"
```

### Run a single test method

```bash
./gradlew test --tests "com.brunotot.starter.app.country.CountryControllerTest.update_WithSuperAdminRole_UpdatesTaxAndKeywords"
```

### Current controller integration test pattern

- SpringBootTest
- AutoConfigureMockMvc
- Transactional
- ActiveProfiles("test")

## Build

```bash
./gradlew build --console=plain
```
