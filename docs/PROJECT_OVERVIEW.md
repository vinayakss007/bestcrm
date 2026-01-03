# Project Overview: abetworks crm

This document provides a comprehensive summary of the technical architecture, development roadmap, and operational strategy for the abetworks crm application. It consolidates information from all project documentation into a single guide.

---

## 1. High-Level System Design

The system is architected as two distinct, independently deployable applications: a **Next.js Frontend** and a **NestJS Backend**. This separation of concerns allows for independent development, scaling, and deployment cycles. The backend is designed from the ground up as a secure, **multi-tenant** platform.

- **`DESIGN.md`**: Contains the high-level strategic overview.
- **`ARCHITECTURE.md`**: Contains detailed backend technical specifications, including the multi-tenant data model.
- **`CICD.md`**: Outlines the automated deployment pipelines.
- **`INACTIVE_FEATURES.md`**: Lists all UI elements that are currently placeholders and require backend integration.

---

## 2. Frontend Architecture & Implementation

The frontend is a modern web application responsible for all user interface rendering and client-side interactivity. It is currently a fully-featured, responsive UI prototype with mock data.

### 2.1. Frontend Technology Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** React with TypeScript
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **Deployment:** Vercel or Firebase Hosting

### 2.2. Frontend Project Structure
- **`/src/app/(app)`**: Main application routes (Dashboard, Accounts, etc.).
- **`/src/components`**: Reusable React components.
- **`/src/lib/actions.ts`**: Contains all Server Actions that communicate with the live backend API.

---

## 3. Backend Architecture & Implementation

The backend is a standalone NestJS application designed for scalability, security, and strict data isolation between different client organizations.

### 3.1. Backend Technology Stack
- **Runtime:** Node.js (v20+)
- **Framework:** NestJS (v10+)
- **Database:** PostgreSQL (v15+) with **Drizzle ORM**.
- **Multi-Tenancy:** The core architectural principle. All data is scoped via an `organization_id`.
- **Containerization:** Docker

### 3.2. Data Model & Database Schema
The complete database schema is the single source of truth, defined in:
- **`backend/src/db/schema.ts`**: Contains all table definitions (`organizations`, `crmUsers`, `crmAccounts`, etc.) using Drizzle ORM syntax. This schema is designed to enforce multi-tenancy.

### 3.3. API Design & Contract
The REST API is formally defined and serves as the contract between the frontend and backend.
- **`docs/openapi.yaml`**: A complete OpenAPI 3.0 specification for all v1 endpoints.
- **`docs/SDK.md`**: Provides instructions for auto-generating a type-safe TypeScript client SDK from the OpenAPI specification (though this project uses Server Actions instead).

### 3.4. User & Data Hierarchy
- **Organizations:** The top-level entity. Represents a customer company.
- **Users:** Belong to an Organization and have defined roles (`user`, `company-admin`, `super-admin`).
- **Data Isolation:** All database queries in the backend API are strictly filtered by the `organization_id` from the authenticated user's JWT, preventing any possibility of data crossover.
- **Soft Deletes:** Core data is soft-deleted (`is_deleted` flag) to prevent accidental permanent loss.

---

## 4. CI/CD & Deployment Strategy

The project uses GitHub Actions for automated, independent deployments of the frontend and backend. The pipelines are defined in the `.github/workflows/` directory.

---

## 5. Complete Implementation Roadmap

This is the actionable "to-do list" for the development teams, moving from prototype to a fully functional application.

### Phase 1: Backend API Implementation (Complete)
1.  **Setup & Auth:**
    - [x] Initialized NestJS project and database schema for multi-tenancy.
    - [x] Implemented the user authentication module to issue JWTs containing `userId` and `organizationId`.
2.  **Core API Implementation:**
    - [x] Built all CRUD endpoints for `Accounts`, `Contacts`, `Leads`, etc., as defined in `docs/openapi.yaml`. All database queries are scoped to the `organization_id`.
3.  **Advanced Features:**
    - [x] Implemented role-based access control (RBAC) in API endpoints.
    - [x] Built a background job system (e.g., BullMQ) for tasks like sending emails. (Placeholder, not fully implemented)
    - [x] Implemented file upload handling.

### Phase 2: Frontend Integration (Complete)
1.  **API Integration:**
    - [x] Replaced all mock data with live API calls using Next.js Server Actions.
    - [x] Implemented the login UI and JWT session management.
2.  **Connect UI to Live Data:**
    - [x] All "Add/Edit" dialogs are functional and use Server Actions to mutate data.
    - [x] `src/lib/actions.ts` contains all live API calls.
    - [x] Implemented live search, sort, and filter functionality.
3.  **Finalize & Deploy (Next Steps):**
    - [ ] Write E2E tests (e.g., using Playwright) to simulate user flows.
    - [ ] Configure and activate the frontend and backend deployment pipelines in CI/CD.
