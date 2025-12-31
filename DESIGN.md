
# System Design Document: abetworks crm

This document provides a high-level overview of the system architecture for the abetworks crm platform. For detailed technical specifications, please refer to the following documents:

- **[Technical Architecture (`ARCHITECTURE.md`)](./ARCHITECTURE.md):** For developers. Details the backend stack, project structure, data models, and local setup.
- **[CI/CD Pipeline (`CICD.md`)](./CICD.md):** For DevOps. Outlines the automated build, test, and deployment pipelines for frontend and backend.

## 1. Guiding Principles

*   **Scalability & Performance:** The architecture must support a growing number of tenants and users without degradation in performance.
*   **Security:** Multi-tenancy requires strict data isolation and role-based access control (RBAC) at every layer.
*   **Maintainability:** A clean, well-documented, and modular codebase is essential for long-term development and support.
*   **API-First:** All core functionality is exposed through a secure, versioned REST API, defined in `docs/openapi.yaml`.
*   **Reliability & Redundancy:** Leverage cloud-native patterns and managed services to ensure high availability.

---

## 2. High-Level Architecture

The system is composed of two distinct, independently deployable applications: a **Next.js Frontend** and a **NestJS Backend**.

### 2.1. Frontend Architecture

The frontend is a modern Next.js application responsible for all user interface rendering and client-side interactivity.

*   **Framework:** Next.js 14+ with the App Router.
*   **UI:** React with TypeScript, styled using Tailwind CSS and ShadCN UI components.
*   **Data Fetching:** Communicates with the backend via a REST API. It uses Server Actions and client-side hooks to fetch and mutate data.
*   **Authentication:** Manages JWTs provided by the backend to handle user sessions and authenticated requests.
*   **Deployment:** Deployed as a static/hybrid site to a dedicated hosting provider like Vercel or Firebase Hosting. See `CICD.md` for details.

### 2.2. Backend Architecture

The backend is a dedicated, standalone server responsible for all business logic, data processing, and persistence.

*   **Framework:** **NestJS** (TypeScript).
*   **Database:** **PostgreSQL** for primary data storage.
*   **ORM:** **Drizzle ORM** for type-safe database interaction.
*   **Caching & Jobs:** **Redis** for performance caching and managing background job queues with **BullMQ**.
*   **Authentication:** Manages user identity and issues JWTs using the **Passport.js** library.
*   **Multi-Tenancy:** Enforced at the application layer. All database queries are scoped to the authenticated user's organization.
*   **Deployment:** Containerized with **Docker** and deployed to a scalable container platform like Google Cloud Run. See `ARCHITECTURE.md` and `CICD.md` for details.

---

## 3. Implementation Plan

With the foundational architecture and documentation in place, the project is ready for implementation.

1.  **Phase 1: Frontend Prototyping & Design**
    *   **[DONE]** Design system architecture and create initial documentation.
    *   **[DONE]** Define the complete PostgreSQL database schema (`src/lib/schema.ts`).
    *   **[DONE]** Define the v1 API contract (`docs/openapi.yaml`).
    *   **[DONE]** Build a complete, responsive frontend UI prototype with mock data and clear navigation.

2.  **Phase 2: Backend Foundation (Next Steps)**
    *   **[NEXT]** Initialize the NestJS backend project in a `/backend` directory based on `ARCHITECTURE.md`.
    *   **[NEXT]** Implement the Authentication module (user registration, login) to issue JWTs.
    *   **[NEXT]** Begin implementing the `Accounts` CRUD module in the backend, following the API contract.

3.  **Phase 3: Frontend Integration**
    *   Generate a TypeScript SDK for the frontend from `docs/openapi.yaml`.
    *   Replace all mock data in `src/lib/actions.ts` with live API calls using the generated SDK.
    *   Wire up the frontend UI (forms, dialogs, search, pagination) to the live data, making the application fully functional.

4.  **Phase 4: Core CRM & Enterprise Features**
    *   Implement full CRUD API endpoints for all remaining CRM objects (Leads, Contacts, Invoices, etc.).
    *   Connect the corresponding frontend pages to the live APIs.
    *   Build out the background worker system for email notifications.
    *   Implement "super admin" features for managing custom fields and user roles.
