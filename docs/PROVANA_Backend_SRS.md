# PROVANA Backend Software Requirements Specification (SRS)

**Project:** PROVANA  
**System:** Nutrition & Fitness E-Commerce Backend  
**Architecture:** Production-oriented Modular Monolith  
**Backend:** Java 21+ / Spring Boot  
**Database:** PostgreSQL  
**Payment:** Razorpay  
**AI:** RAG + LangChain  
**API:** REST / JSON  
**Documentation:** OpenAPI / Swagger

---

## 1. Purpose

This SRS defines the backend requirements, architecture, database model, APIs, security, integrations, development phases, testing, and production requirements for PROVANA.

PROVANA is a nutrition, fitness, wellness, healthy-food, and gym-accessories e-commerce platform.

The backend is the authoritative business/data layer behind the existing frontend.

### Core principle

> **CMS/content controls presentation; application code controls commerce behavior.**

The backend must never trust the frontend for price, discount, tax, coupon eligibility, inventory, payment status, order status, or refund status.

---

## 2. Current Objectives

The current implementation has four primary objectives:

1. **E-commerce core:** product catalogue, RBAC, cart, checkout, orders.
2. **Interactive frontend support:** backend APIs for the existing GSAP-driven storefront.
3. **Real commerce integrations:** Razorpay plus manual courier setup, with real courier API integration when suitable sandbox credentials are available.
4. **AI assistant:** grounded RAG + LangChain assistant using actual PROVANA data.

---

## 3. Scope

### In Scope

- Registration/login/authentication
- JWT authorization
- RBAC and permissions
- Product catalogue
- Categories/subcategories/brands
- Products, variants, SKUs
- Product nutrition/ingredients/allergens/FAQs
- Inventory
- Cart
- Wishlist foundation
- Addresses
- Coupons
- Checkout
- Razorpay payments
- Orders
- Manual shipping
- Courier provider abstraction
- Returns/refunds foundation
- Reviews foundation
- Admin APIs
- AI assistant
- RAG knowledge base
- LangChain integration
- Testing
- Docker/CI/CD/production hardening

### First-MVP Exclusions

- Advanced recommendation engine
- AI SEO generation
- AI review sentiment
- Advanced analytics
- Marketing automation
- Multi-vendor marketplace
- Microservices decomposition
- Multiple simultaneous courier providers
- Complex campaign engine
- Full CMS implementation

---

## 4. Product Catalogue

The catalogue follows:

```text
Category
  ↓
Subcategory
  ↓
Product
  ↓
Variant
  ↓
SKU
  ↓
Inventory
```

### Categories

**Protein**
- Whey Protein
- Whey Isolate
- Plant Protein
- Casein
- Clear Whey
- Ready-to-Drink Protein

**Performance**
- Creatine
- Pre-Workout
- BCAA
- EAA
- Electrolytes
- Glutamine

**Weight Management**
- Mass Gainer
- Meal Replacement

**Vitamins & Wellness**
- Multivitamins
- Omega-3
- Vitamin D
- Magnesium
- Zinc

**Ayurveda & Herbal**
- Ashwagandha
- Shilajit
- Gokshura
- Chyawanprash
- Herbal Blends

**Healthy Foods**
- Protein Bars
- Protein Oats
- Protein Chips
- Peanut Butter
- Granola
- Protein Cookies

**Gym Accessories**
- Shakers
- Gym Bottles
- Gym Bags
- Gloves
- Lifting Straps
- Wrist Wraps
- Resistance Bands

Each sellable SKU may have its own price, inventory, attributes, images, and availability.

---

## 5. Technology Stack

### Backend

- Java 21+
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- Bean Validation
- Maven

### Database

- PostgreSQL

### API

- REST
- JSON
- OpenAPI
- Swagger UI

### Security

- Spring Security
- JWT
- Password hashing
- RBAC
- Permission-based authorization

### Payments

- Razorpay

### AI

- LangChain
- RAG
- Embeddings
- Vector store
- LLM

If LangChain is implemented in Python, the AI layer may run as a separate service while the main commerce backend remains Java/Spring Boot.

### Infrastructure

- Docker
- Docker Compose
- Git/GitHub
- CI/CD
- Environment variables/secrets

---

## 6. High-Level Architecture

```text
                 PROVANA FRONTEND
                        |
                        v
                 REST API / HTTPS
                        |
          +-------------+-------------+
          |                           |
     SPRING BOOT                 AI SERVICE
          |                     LangChain/RAG
          |                           |
    Controller Layer                 |
          |                           |
     Service Layer <-----------------+
          |
     Repository Layer
          |
      PostgreSQL
```

External integrations:

```text
Spring Boot
   ├── Razorpay
   ├── Courier Provider
   └── Notification Provider
```

Request flow:

```text
Controller
   ↓
Request DTO + Validation
   ↓
Service / Business Logic
   ↓
Repository
   ↓
PostgreSQL
```

JPA entities must not be exposed directly through APIs.

---

## 7. Backend Modules

```text
com.provana
├── auth
├── user
├── role
├── permission
├── catalog
│   ├── category
│   ├── brand
│   ├── product
│   ├── variant
│   ├── sku
│   └── media
├── inventory
├── cart
├── wishlist
├── checkout
├── coupon
├── order
├── payment
├── shipping
├── return
├── refund
├── review
├── ai
├── notification
├── audit
└── common
    ├── config
    ├── exception
    ├── response
    ├── validation
    └── util
```

---

# 8. Core Database Entities

```text
User
Role
Permission
UserRole
RolePermission

CustomerProfile
Address

Category
Subcategory
Brand
Product
ProductVariant
SKU
ProductImage
ProductVideo
NutritionInformation
Ingredient
Allergen
ProductFAQ

Inventory
InventoryMovement
InventoryReservation

Cart
CartItem
Wishlist
WishlistItem

Coupon
CouponUsage

Checkout
Order
OrderItem

Payment
PaymentEvent

Shipment
ShipmentTrackingEvent

ReturnRequest
Refund

Review
AuditLog
```

---

# 9. Authentication

### Registration

```http
POST /api/v1/auth/register
```

Requirements:

- Validate input
- Check email uniqueness
- Validate password
- Hash password
- Create user
- Assign CUSTOMER role
- Create customer profile
- Never return password/hash

### Login

```http
POST /api/v1/auth/login
```

Flow:

```text
Email + Password
 → Spring Security
 → Verify Password
 → Load Roles/Permissions
 → Generate JWT
 → Authentication Response
```

### APIs

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

---

# 10. RBAC

### Roles

```text
CUSTOMER
ADMIN
MANAGER
PRODUCT_MANAGER
ORDER_MANAGER
CONTENT_MANAGER
```

### Example Permissions

```text
PRODUCT_VIEW
PRODUCT_CREATE
PRODUCT_UPDATE
PRODUCT_DELETE

CATEGORY_VIEW
CATEGORY_CREATE
CATEGORY_UPDATE
CATEGORY_DELETE

INVENTORY_VIEW
INVENTORY_UPDATE

ORDER_VIEW
ORDER_UPDATE

CUSTOMER_VIEW

COUPON_VIEW
COUPON_CREATE
COUPON_UPDATE

SHIPMENT_VIEW
SHIPMENT_UPDATE

USER_VIEW
USER_MANAGE

ROLE_MANAGE
PERMISSION_MANAGE
```

Authorization:

```text
JWT
 ↓
User
 ↓
Roles
 ↓
Permissions
 ↓
Endpoint authorization
```

Frontend-only hiding is never considered security.

---

# 11. Product Catalogue

### Product

```text
id
name
slug
brandId
categoryId
subcategoryId
description
highlights
benefits
usageInstructions
servingSize
servingsPerContainer
status
publishedAt
createdAt
updatedAt
```

### Product Variant

```text
id
productId
name
flavor
size
attributes
status
```

### SKU

```text
id
variantId
skuCode
price
compareAtPrice
currency
status
```

### Customer APIs

```http
GET /api/v1/products
GET /api/v1/products/{slug}
GET /api/v1/categories
GET /api/v1/categories/{slug}
GET /api/v1/products/{id}/variants
GET /api/v1/products/{id}/reviews
```

### Admin APIs

```http
POST   /api/v1/admin/products
GET    /api/v1/admin/products
GET    /api/v1/admin/products/{id}
PUT    /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}
```

---

# 12. Inventory

Inventory is backend-controlled.

### Inventory

```text
id
skuId
availableQuantity
reservedQuantity
lowStockThreshold
updatedAt
```

### Movement types

```text
PURCHASE
SALE
RESERVATION
RELEASE
RETURN
ADJUSTMENT
```

### Flow

```text
Available Stock
 → Checkout
 → Reserve
 → Payment Success
 → Finalize Sale
```

On payment failure:

```text
Reservation
 → Release
 → Stock Available
```

Concurrency protection must prevent overselling.

---

# 13. Cart

### Cart

```text
id
userId
status
createdAt
updatedAt
```

### CartItem

```text
id
cartId
skuId
quantity
unitPriceSnapshot
createdAt
updatedAt
```

### APIs

```http
GET    /api/v1/cart
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/{id}
DELETE /api/v1/cart/items/{id}
DELETE /api/v1/cart
```

Add-to-cart validation:

```text
SKU exists?
 → Active?
 → Quantity valid?
 → Inventory available?
 → Add/update cart
```

Frontend price is never authoritative.

---

# 14. Checkout

Checkout converts a validated cart into a purchase.

```text
Cart
 ↓
Validate Cart
 ↓
Validate SKU
 ↓
Validate Price
 ↓
Validate Inventory
 ↓
Validate Address
 ↓
Validate Coupon
 ↓
Calculate Shipping
 ↓
Calculate Tax
 ↓
Calculate Final Total
 ↓
Create Checkout
```

Calculation:

```text
Subtotal
 - Discount
 + Shipping
 + Tax
 = Final Payable Amount
```

### APIs

```http
POST /api/v1/checkout/preview
POST /api/v1/checkout/create
```

Backend must calculate final totals independently of frontend calculations.

---

# 15. Addresses

### Address

```text
id
userId
fullName
phone
addressLine1
addressLine2
city
state
postalCode
country
isDefault
createdAt
updatedAt
```

### APIs

```http
GET    /api/v1/customers/addresses
POST   /api/v1/customers/addresses
PUT    /api/v1/customers/addresses/{id}
DELETE /api/v1/customers/addresses/{id}
```

Users can only access their own addresses.

---

# 16. Coupons

### Coupon

```text
id
code
type
value
minimumOrderValue
maximumDiscount
startAt
endAt
usageLimit
perUserLimit
status
```

Types:

```text
PERCENTAGE
FIXED
```

Validation:

```text
Exists
 ↓
Active
 ↓
Valid Date
 ↓
User Eligible
 ↓
Minimum Value
 ↓
Usage Limit
 ↓
Calculate Discount
```

API:

```http
POST /api/v1/coupons/validate
```

Frontend-provided discount values must not be trusted.

---

# 17. Razorpay Integration

Razorpay is the primary payment gateway.

### Payment flow

```text
Checkout
 ↓
Validate Cart
 ↓
Calculate Final Amount
 ↓
Create PROVANA Order
 ↓
Create Razorpay Order
 ↓
Frontend opens Razorpay
 ↓
Customer pays
 ↓
Razorpay response
 ↓
Backend verifies
 ↓
Payment SUCCESS
 ↓
Confirm Order
 ↓
Finalize Inventory
```

### Payment

```text
id
orderId
provider
providerOrderId
providerPaymentId
amount
currency
status
method
failureReason
createdAt
updatedAt
```

### States

```text
CREATED
PENDING
PROCESSING
SUCCESS
FAILED
CANCELLED
REFUNDED
```

### APIs

```http
POST /api/v1/payments/razorpay/create
POST /api/v1/payments/razorpay/verify
POST /api/v1/payments/razorpay/webhook
GET  /api/v1/payments/{id}
```

### Security

Verify:

- Razorpay order ID
- Payment ID
- Signature
- Amount
- Currency
- Associated PROVANA order

Webhook verification and duplicate callback protection are mandatory.

---

# 18. Orders

### Order

```text
id
orderNumber
userId
subtotal
discount
shippingAmount
taxAmount
totalAmount
currency
status
paymentStatus
shippingStatus
createdAt
updatedAt
```

### OrderItem

```text
id
orderId
skuId
productNameSnapshot
variantSnapshot
quantity
unitPrice
discount
tax
total
```

Historical commercial data must be stored as snapshots.

### APIs

```http
GET  /api/v1/orders
GET  /api/v1/orders/{id}
POST /api/v1/orders
```

Customers can access only their own orders.

---

# 19. Order State Machine

Normal flow:

```text
CREATED
 ↓
PAYMENT_PENDING
 ↓
PAID
 ↓
PROCESSING
 ↓
PACKED
 ↓
SHIPPED
 ↓
OUT_FOR_DELIVERY
 ↓
DELIVERED
```

Other states:

```text
PAYMENT_FAILED
CANCELLED
RETURN_REQUESTED
RETURNED
REFUND_PENDING
REFUNDED
```

Only valid transitions are permitted.

---

# 20. Shipping / Courier

## Phase 1: Manual Shipping

Admin can manage:

```text
Courier Name
Tracking Number
Shipment Status
Expected Delivery Date
```

### Shipment

```text
id
orderId
providerName
trackingNumber
status
expectedDeliveryDate
shippedAt
deliveredAt
createdAt
updatedAt
```

## Phase 2: Courier API

If Shiprocket or another provider provides suitable sandbox/test credentials:

```text
Order
 ↓
ShippingService
 ↓
ShippingProvider
 ↓
ManualShippingProvider
OR
ShiprocketShippingProvider
```

Interface:

```java
interface ShippingProvider {
    ShipmentResponse createShipment(...);
    TrackingResponse trackShipment(...);
    void cancelShipment(...);
}
```

The commerce core must not depend directly on one courier vendor.

---

# 21. Returns and Refunds

### Return flow

```text
DELIVERED
 ↓
Return Request
 ↓
Validate Policy
 ↓
Admin Approval
 ↓
Pickup
 ↓
Received
 ↓
Refund
```

### ReturnRequest

```text
id
orderId
userId
reason
status
requestedAt
approvedAt
completedAt
```

### Refund

```text
id
orderId
paymentId
amount
reason
status
providerRefundId
createdAt
updatedAt
```

Refunds must be idempotent.

---

# 22. Wishlist

### APIs

```http
GET    /api/v1/wishlist
POST   /api/v1/wishlist/{productId}
DELETE /api/v1/wishlist/{productId}
```

Wishlist data is customer-specific.

---

# 23. Reviews

Reviews should be linked to eligible purchases.

### Review

```text
id
productId
userId
orderId
rating
title
comment
status
createdAt
updatedAt
```

Statuses:

```text
PENDING
APPROVED
REJECTED
```

The backend should verify purchase eligibility.

---

# 24. Admin APIs

Admin modules:

```text
Dashboard
Products
Categories
Brands
Variants
SKUs
Inventory
Orders
Payments
Shipments
Customers
Users
Roles
Permissions
Coupons
Reviews
```

Every admin API must enforce RBAC.

---

# 25. AI Assistant — RAG + LangChain

The AI assistant is a grounded PROVANA shopping/nutrition assistant.

### Architecture

```text
User
 ↓
AI Assistant API
 ↓
LangChain
 ↓
+-------------------+
| Retriever         |
| Tool/API Layer    |
+-------------------+
 ↓
Vector Store / PROVANA APIs
 ↓
Context
 ↓
LLM
 ↓
Validated Response
```

---

# 26. AI Knowledge Base

Initial sources:

### Product data

- Product name
- Category
- Description
- Highlights
- Benefits
- Ingredients
- Nutrition
- Serving size
- Usage
- Allergens
- FAQs

### Educational content

- Nutrition articles
- Product guides
- FAQs
- Approved educational content

### Policies

- Shipping policy
- Return policy
- Refund policy
- Payment information

Only approved and current information should be indexed.

---

# 27. RAG Ingestion

```text
PROVANA Data
 ↓
Normalize
 ↓
Chunk
 ↓
Generate Embeddings
 ↓
Vector Store
```

Possible sources:

```text
Product Database
CMS Content
Nutrition Articles
FAQs
Policy Documents
```

---

# 28. RAG Query

```text
User Question
 ↓
Query Processing
 ↓
Embedding
 ↓
Vector Search
 ↓
Relevant Context
 ↓
LangChain Prompt
 ↓
LLM
 ↓
Response Validation
 ↓
User
```

Example:

> Which protein is suitable for a post-workout routine?

The assistant must retrieve actual PROVANA product information before responding.

---

# 29. AI Tools

Potential controlled tools:

```text
searchProducts()
getProduct()
getProductVariants()
getCurrentPrice()
checkAvailability()
searchKnowledge()
getOrderStatus()
```

Every tool must enforce normal backend authorization.

For example:

```text
getOrderStatus(orderId)
```

must verify:

```text
Authenticated User
 ↓
Order belongs to User
```

---

# 30. AI Guardrails

AI must not independently determine:

- Product price
- Inventory
- Payment status
- Order status
- Refund status
- Shipping status
- Official policies

Business-critical facts must come from deterministic backend services or approved knowledge sources.

AI security must address:

- Prompt injection
- Hallucinations
- Incorrect product information
- Unauthorized data access
- Sensitive data exposure
- Token/cost control
- Rate limiting
- Response validation
- Logging
- Monitoring
- Fallbacks

---

# 31. AI API

```http
POST /api/v1/ai/chat
```

Request:

```json
{
  "conversationId": "abc123",
  "message": "Suggest a protein for my post-workout routine"
}
```

Response:

```json
{
  "conversationId": "abc123",
  "message": "Based on the available PROVANA products...",
  "products": [],
  "sources": []
}
```

---

# 32. API Standards

All APIs use:

```text
/api/v1/
```

Examples:

```text
/api/v1/products
/api/v1/cart
/api/v1/checkout
/api/v1/orders
/api/v1/payments
/api/v1/ai/chat
```

### Request

```text
HTTP Request
 ↓
Controller
 ↓
Request DTO
 ↓
Validation
 ↓
Service
 ↓
Repository
 ↓
Database
```

### Response

```text
Database
 ↓
Entity
 ↓
Mapper
 ↓
Response DTO
 ↓
API Response
```

---

# 33. Validation

Validation is required for:

- Registration
- Login
- Products
- Variants
- SKUs
- Cart quantity
- Addresses
- Coupons
- Checkout
- Payments
- Orders
- Shipping
- Reviews

Examples:

```text
Required fields
Email format
Password rules
Quantity limits
Price rules
Address validation
Coupon validation
```

---

# 34. Global Exception Handling

Use centralized exception handling.

Categories:

```text
RESOURCE_NOT_FOUND
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
BUSINESS_RULE_VIOLATION
INVENTORY_ERROR
PAYMENT_ERROR
ORDER_STATE_ERROR
SHIPPING_ERROR
DATABASE_ERROR
INTERNAL_ERROR
```

Example:

```json
{
  "success": false,
  "errorCode": "INSUFFICIENT_STOCK",
  "message": "Requested quantity is not available",
  "timestamp": "2026-10-05T12:00:00"
}
```

---

# 35. Transactions

Multi-step commerce operations must use appropriate transaction boundaries.

Example:

```text
Place Order
 ├── Validate Cart
 ├── Validate Inventory
 ├── Create Order
 ├── Create Order Items
 ├── Reserve Inventory
 └── Create Payment Record
```

Failures must not leave inconsistent order/inventory/payment data.

---

# 36. Idempotency

Required for:

```text
Create Order
Create Payment
Payment Webhook
Create Shipment
Refund
```

Flow:

```text
Request
 ↓
Idempotency Key
 ↓
Process
 ↓
Persist Result
```

A retry must not create duplicate commerce records.

---

# 37. Security

Required:

- HTTPS in production
- JWT authentication
- RBAC
- Permission authorization
- Password hashing
- Input validation
- CORS configuration
- Secure headers
- Rate limiting
- Secret management
- Audit logging
- Webhook verification
- Object ownership checks
- ORM/parameterized database queries

Never store in source code:

```text
Database passwords
JWT secrets
Razorpay secrets
AI API keys
Courier secrets
```

---

# 38. Audit Logging

### AuditLog

```text
id
userId
action
entityType
entityId
oldValue
newValue
ipAddress
userAgent
createdAt
```

Examples:

```text
PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_DELETED
INVENTORY_ADJUSTED
ORDER_STATUS_CHANGED
REFUND_CREATED
ROLE_CHANGED
USER_CREATED
```

---

# 39. Development Phases

## Phase 0 — Backend Foundation

### Deliverables

- Spring Boot project
- Maven
- PostgreSQL
- Environment configuration
- JPA
- DTO architecture
- Validation
- Exception handling
- Response format
- Swagger/OpenAPI
- Logging

### Exit Criteria

Application starts and connects to PostgreSQL.

---

## Phase 1 — Authentication + RBAC

### Deliverables

- User
- Role
- Permission
- JWT
- Password hashing
- Registration
- Login
- Refresh
- Logout
- Current-user API
- Backend authorization

### Exit Criteria

CUSTOMER cannot access ADMIN APIs.

---

## Phase 2 — Product Catalogue

### Deliverables

- Category
- Subcategory
- Brand
- Product
- Variant
- SKU
- Media
- Nutrition
- Ingredients
- Allergens
- FAQs
- Customer APIs
- Admin APIs

### Exit Criteria

Frontend receives products from PostgreSQL instead of hardcoded data.

---

## Phase 3 — Inventory

### Deliverables

- Inventory
- Inventory movement
- Reservation
- Stock validation
- Low-stock threshold
- Admin inventory APIs
- Concurrency protection

### Exit Criteria

Insufficient stock prevents invalid purchases.

---

## Phase 4 — Cart

### Deliverables

- Cart
- Cart items
- Add
- Update quantity
- Remove
- Clear
- Cart totals

### Exit Criteria

Authenticated cart persists in PostgreSQL.

---

## Phase 5 — Checkout

### Deliverables

- Address
- Coupon validation
- Shipping calculation
- Tax calculation
- Price validation
- Inventory validation
- Checkout preview
- Checkout creation

### Exit Criteria

Backend independently calculates final payable amount.

---

## Phase 6 — Razorpay

### Deliverables

- Razorpay configuration
- Razorpay order creation
- Payment entity
- Verification
- Webhook
- Signature verification
- Idempotency
- Payment state management

### Exit Criteria

Sandbox payment successfully updates PROVANA payment/order state.

---

## Phase 7 — Orders

### Deliverables

- Order
- OrderItem
- State machine
- Order history
- Order details
- Admin management
- Inventory finalization

### Exit Criteria

Complete flow works:

```text
Cart → Checkout → Razorpay → Payment → Order → Inventory
```

---

## Phase 8 — Shipping/Courier

### Version 1

- Manual shipment creation
- Courier name
- Tracking number
- Shipment status
- Admin management

### Version 2

- Provider abstraction
- Sandbox courier API
- Shipment creation
- Tracking
- Webhook/status synchronization

### Exit Criteria

Paid orders can be shipped and tracked.

---

## Phase 9 — Returns + Refunds

### Deliverables

- Return request
- Policy validation
- Admin approval
- Refund entity
- Razorpay refund
- Refund status
- Idempotency

### Exit Criteria

Eligible orders can complete controlled return/refund flow.

---

## Phase 10 — Admin

### Deliverables

- Admin APIs
- Products
- Categories
- Inventory
- Orders
- Customers
- Users
- Roles
- Permissions
- Coupons
- Shipping

### Exit Criteria

Admin can manage the core commerce system through APIs.

---

## Phase 11 — AI RAG + LangChain

### Deliverables

- AI service
- LangChain
- Knowledge ingestion
- Embeddings
- Vector store
- Retriever
- Prompt templates
- Product/API tools
- Chat endpoint
- Guardrails
- Source/context handling
- Logging
- Rate limiting

### Exit Criteria

AI answers product/nutrition questions using actual PROVANA information and does not invent business-critical facts.

---

## Phase 12 — Testing

### Unit Tests

```text
ProductService
CartService
CheckoutService
CouponService
InventoryService
PaymentService
OrderService
ShippingService
RefundService
```

### Integration Tests

```text
Spring Boot + PostgreSQL
```

### Security Tests

Verify:

```text
CUSTOMER → cannot access ADMIN APIs
PRODUCT_MANAGER → cannot modify orders
ORDER_MANAGER → cannot modify products
Unauthenticated → cannot access protected APIs
```

### Payment Tests

Use Razorpay test/sandbox credentials.

Test:

- Success
- Failure
- Duplicate callback
- Invalid signature
- Incorrect amount
- Retry/timeout

---

## Phase 13 — Production Engineering

### Deliverables

- Dockerfile
- Docker Compose
- Database migrations
- CI/CD
- Health checks
- Logging
- Monitoring
- Error tracking
- Performance optimization
- Security hardening
- Production configuration
- Backup strategy

---

# 40. Development Dependency

```text
Phase 0
Foundation
 ↓
Phase 1
Auth + RBAC
 ↓
Phase 2
Catalogue
 ↓
Phase 3
Inventory
 ↓
Phase 4
Cart
 ↓
Phase 5
Checkout
 ↓
Phase 6
Razorpay
 ↓
Phase 7
Orders
 ↓
Phase 8
Shipping
 ↓
Phase 9
Returns / Refunds
 ↓
Phase 10
Admin
 ↓
Phase 11
RAG + LangChain
 ↓
Phase 12
Testing
 ↓
Phase 13
Production
```

---

# 41. Frontend Integration

Current:

```text
Frontend
 ↓
Hardcoded product data
 ↓
StoreContext
 ↓
localStorage
```

Target:

```text
Frontend
 ↓
API Client
 ↓
Spring Boot REST API
 ↓
PostgreSQL
```

### Mapping

```text
/products
 → GET /api/v1/products

/products/[slug]
 → GET /api/v1/products/{slug}

/cart
 → Cart APIs

/checkout
 → Checkout APIs

/orders
 → Order APIs

/payment
 → Razorpay APIs

/ai
 → AI APIs
```

The frontend should be migrated incrementally rather than rewritten.

---

# 42. Complete Commerce Flow

```text
Customer
   ↓
Product Catalogue
   ↓
Product / SKU
   ↓
Cart
   ↓
Checkout
   ↓
Address + Coupon + Shipping
   ↓
Backend Price Validation
   ↓
Inventory Validation
   ↓
Create PROVANA Order
   ↓
Create Razorpay Order
   ↓
Razorpay Checkout
   ↓
Payment Verification
   ↓
Confirm Order
   ↓
Finalize Inventory
   ↓
Create Shipment
   ↓
Tracking
   ↓
Delivered
   ↓
Review / Return
   ↓
Refund
```

---

# 43. Definition of Done

Every backend module is complete only when it includes:

```text
Entity
 ↓
Repository
 ↓
Service
 ↓
DTO
 ↓
Validation
 ↓
Controller
 ↓
Security
 ↓
Exception Handling
 ↓
Transactions
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Swagger Documentation
```

Payment, order, inventory, shipment, and refund modules additionally require:

- Idempotency
- State-transition validation
- Failure handling
- Auditability

---

# 44. Final Success Criteria

The backend is functionally ready when:

1. Users can register and authenticate.
2. RBAC protects administrative APIs.
3. Products are served from PostgreSQL.
4. Product variants and SKUs are supported.
5. Inventory is backend-controlled.
6. Customers can manage carts.
7. Checkout calculates totals server-side.
8. Coupons are validated server-side.
9. Razorpay sandbox payments work end-to-end.
10. Orders are created only through valid commerce flows.
11. Duplicate payment callbacks do not create duplicate orders.
12. Inventory remains consistent.
13. Shipments can be manually managed.
14. Courier integration can be added through the provider abstraction.
15. Returns/refunds use controlled state transitions.
16. Admin operations are protected by RBAC.
17. AI answers grounded product/nutrition questions.
18. AI cannot invent business-critical information.
19. Critical workflows have unit/integration/security tests.
20. Backend can be deployed using Docker and environment-based secrets.

---

# 45. Final Architecture Principle

```text
Frontend
    =
Experience

Backend
    =
Business Authority

PostgreSQL
    =
Source of Truth

Razorpay
    =
Payment Provider

Courier
    =
Fulfillment Provider

RAG + LangChain
    =
Intelligence Layer
```

PROVANA should be developed as a production-oriented commerce system rather than a collection of CRUD endpoints. The modular backend must allow future additions such as CMS, advanced search, recommendations, analytics, AI content generation, and additional integrations without rewriting the commerce core.
