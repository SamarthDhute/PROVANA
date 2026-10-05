# PROVANA — Backend Engineering (Modular Monolith)

> **Brand**: PROVANA (Premium Sports Nutrition & Athletic DTC E-Commerce)  
> **Architecture**: Production-oriented Modular Monolith  
> **Framework**: Java 21+ / Spring Boot 3.3.5 / Spring Data JPA / Hibernate  
> **Database**: PostgreSQL 18+ with Flyway schema migrations  
> **API Standard**: RESTful JSON, OpenAPI 3.0 / Swagger UI  
> **Payment Engine**: Razorpay (Phase 6)  
> **AI Layer**: RAG + LangChain Catalog Grounded Assistant (Phase 11)  

---

## 1. Architectural Philosophy & Non-Negotiables

1. **Golden Rule**:
   > *"CMS/content controls presentation; application code controls commerce behavior."*
2. **Never Trust the Frontend**:
   The frontend is an untrusted presentation layer. The backend is the single source of truth for:
   - Product pricing, discounts, and tiered bundles
   - Inventory availability and stock reservations
   - Coupon eligibility and tax calculations
   - Payment states and cryptographic HMAC-SHA256 signature verifications
   - Order lifecycle transitions and refund issuance
3. **DTO Encapsulation**:
   JPA Entities are never directly exposed through REST controllers. Strict conversion pipeline:
   `Request DTO → Jakarta Bean Validation → Service (Domain Logic) → Entity → Repository → DB → Mapper → Response DTO → Controller`.

---

## 2. Technology Stack

- **Runtime**: Java 21 / 22 LTS
- **Build Tool**: Apache Maven 3.9+
- **Framework**: Spring Boot 3.3.5
  - `spring-boot-starter-web` (REST APIs, Jackson, Embedded Tomcat)
  - `spring-boot-starter-data-jpa` (Hibernate 6.5, Spring Data JPA)
  - `spring-boot-starter-validation` (Jakarta Bean Validation 3.0)
  - `spring-boot-starter-actuator` (Health probes, readiness, liveness)
- **Database & Migrations**:
  - PostgreSQL 18.0 (JDBC Driver: `org.postgresql:postgresql`)
  - Flyway 10.x (`flyway-core`, `flyway-database-postgresql`)
- **Documentation**: Springdoc OpenAPI Starter (`springdoc-openapi-starter-webmvc-ui:2.6.0`)
- **Connection Pool**: HikariCP (optimized connection reuse, idle timeouts)

---

## 3. Modular Monolith Directory Structure

```text
src/main/java/com/provana/
├── ProvanaApplication.java        # Main Spring Boot Entrypoint
├── config/                        # Global system configurations (OpenAPI, Web CORS, JPA Auditing)
├── common/                        # Shared cross-cutting concerns
│   ├── audit/                     # BaseEntity (@MappedSuperclass with createdAt/updatedAt)
│   ├── exception/                 # GlobalExceptionHandler (@RestControllerAdvice) & domain exceptions
│   ├── response/                  # Unified ApiResponse<T>, PageResponse<T>, ValidationError
│   └── util/                      # Global AppConstants (prefixes, pagination defaults)
├── health/                        # Platform health & operational diagnostic probes
├── auth/                          # Phase 1: Authentication, JWT, Password Hashing
├── user/                          # Phase 1: Users, Roles, Permissions, Customer Profiles
├── catalog/                       # Phase 2: Category -> Subcategory -> Product -> Variant -> SKU
├── inventory/                     # Phase 3: Stock tracking, Reservations, Movements
├── cart/                          # Phase 4: Server-side Cart, Cart Items, Price calculation
├── checkout/                      # Phase 5: Address validation, Taxes, Shipping selection
├── payment/                       # Phase 6: Razorpay Integration, HMAC signatures, Webhooks
├── order/                         # Phase 7: Order state machine, Order snapshots, Fulfillment
├── shipping/                      # Phase 8: Courier provider abstraction & manual dispatch
├── refund/                        # Phase 9: Returns & Razorpay refund ledger
├── admin/                         # Phase 10: Administrative analytics & management
├── ai/                            # Phase 11: Grounded RAG + LangChain assistant
└── cms/                           # CMS content synchronization
```

---

## 4. Prerequisites

1. **JDK 21 or higher** (`java -version`)
2. **Maven 3.8+** (`mvn -v`)
3. **PostgreSQL 14+** running on `localhost:5432` with a database named `provana_db`

---

## 5. Environment Variables & Configuration

The application reads all sensitive and environment-specific values from environment variables with safe defaults for local development.

Copy `.env.example` to `.env` or set environment variables:

| Variable | Description | Local Default |
|---|---|---|
| `SERVER_PORT` | HTTP Web Server Port | `8081` *(avoids port 8080 conflicts)* |
| `SERVER_CONTEXT_PATH` | Application Context Path | `/` |
| `DB_HOST` | PostgreSQL Hostname | `localhost` |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `DB_NAME` | Database Name | `provana_db` |
| `DB_USERNAME` | Database User | `postgres` |
| `DB_PASSWORD` | Database Password | `1234` |
| `CORS_ALLOWED_ORIGINS` | Allowed Frontend Origins | `http://localhost:3000,http://localhost:3001` |
| `SPRING_PROFILES_ACTIVE`| Active Profile (`dev`, `prod`, `test`) | `dev` |

---

## 6. How to Build & Run

### A. Run Database Migrations & Start Server
```powershell
# Navigate to backend directory
cd e:\PROVANA\backend

# Compile and package executable JAR
mvn clean package -DskipTests

# Run the Spring Boot application
java -jar target/provana-backend-0.1.0-SNAPSHOT.jar
```

Or run via Maven Spring Boot plugin:
```powershell
mvn spring-boot:run
```

### B. Run Test Suite
```powershell
mvn test
```

---

## 7. Interactive Endpoints & Documentation

Once the server is running on `http://localhost:8081`:

- **Swagger UI Interactive API Docs**:  
  `http://localhost:8081/swagger-ui.html`
- **OpenAPI 3.0 Raw JSON Spec**:  
  `http://localhost:8081/v3/api-docs`
- **Platform Operational Diagnostic Probe**:  
  `http://localhost:8081/api/v1/health`
- **Spring Boot Actuator Health Probe**:  
  `http://localhost:8081/actuator/health`

---

## 8. Implementation Roadmap

- [x] **Phase 0: Backend Foundation** (COMPLETE)
- [ ] **Phase 1: Authentication & Granular RBAC** (NEXT)
- [ ] **Phase 2: Product Catalogue Hierarchy**
- [ ] **Phase 3: Inventory & Concurrency Management**
- [ ] **Phase 4: Shopping Cart Engine**
- [ ] **Phase 5: Checkout & Price Validation**
- [ ] **Phase 6: Razorpay Payment Processing**
- [ ] **Phase 7: Order Management State Machine**
- [ ] **Phase 8: Shipping & Courier Integration**
- [ ] **Phase 9: Returns & Refunds Processing**
- [ ] **Phase 10: Admin APIs & Analytics**
- [ ] **Phase 11: Grounded RAG + LangChain AI Assistant**
- [ ] **Phase 12: End-to-End Testing Suite**
- [ ] **Phase 13: Production Engineering & Docker Hardening**
