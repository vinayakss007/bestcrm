
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

The backend is a dedicated, standalone server responsible for all business logic, data processing, and persistence. It is designed as a **secure, multi-tenant system**.

*   **Framework:** **NestJS** (TypeScript).
*   **Database:** **PostgreSQL** for primary data storage.
*   **ORM:** **Drizzle ORM** for type-safe database interaction.
*   **Multi-Tenancy:** The core of the architecture. All data is partitioned by an `organization_id`. All API requests are scoped to the authenticated user's organization, ensuring strict data isolation.
*   **Authentication:** Manages user identity and issues JWTs using the **Passport.js** library. The JWT payload contains the `organizationId` necessary to enforce data siloing.
*   **Deployment:** Containerized with **Docker** and deployed to a scalable container platform like Google Cloud Run. See `ARCHITECTURE.md` and `CICD.md` for details.

---

## 3. Implementation Roadmap

This plan outlines the sequence of development from the current state to a fully functional application.

### Phase 1: Architecture & Prototyping (Complete)
- **[DONE]** Design system architecture and create initial documentation (`DESIGN.md`, `ARCHITECTURE.md`).
- **[DONE]** Define the complete multi-tenant PostgreSQL database schema (`backend/src/db/schema.ts`).
- **[DONE]** Define the v1 API contract with all endpoints (`docs/openapi.yaml`).
- **[DONE]** Build a complete, responsive frontend UI prototype with mock data.
- **[DONE]** Refine the architecture for multi-tenancy and user roles.
- **[DONE]** Initialize the NestJS backend project (`/backend`).

### Phase 2: Backend Implementation (Current)
This phase involves building the core backend logic according to the `openapi.yaml` specification.

1.  **User Authentication:** Implement the user registration and login endpoints. This service will issue JWTs that include `userId` and `organizationId`, which is the foundation for all security.
2.  **Core CRUD APIs:** Implement the API endpoints for each module, ensuring all database queries are strictly scoped by `organizationId`. The order of implementation should be:
    -   Accounts
    -   Contacts
    -   Leads
    -   Opportunities
    -   Tasks
    -   Invoices
3.  **Advanced Features:**
    -   Implement webhook endpoints for external data ingestion (e.g., website forms).
    -   Build out the background worker system for email notifications.
    -   Implement role-based access control (RBAC) guards in API endpoints.

### Phase 3: Frontend Integration (Next)
This phase involves replacing all mock data with live API calls.

1.  **Generate SDK:** Generate a TypeScript client SDK from the live backend's OpenAPI specification.
2.  **Connect UI to Data:**
    -   Replace all mock data in `src/lib/actions.ts` and `src/lib/data.ts` with live API calls using the generated SDK.
    -   Wire up all "Add/Edit" forms and dialogs to make them save data.
    -   Implement live server-side search, sorting, and filtering on all list pages.
    -   Make the dashboard charts dynamic.

### Phase 4: Final Polish & Deployment
1.  **Testing:** Write comprehensive unit, integration, and end-to-end tests for both the frontend and backend.
2.  **Deployment:** Configure and activate the CI/CD pipelines in `.github/workflows/` to deploy the applications to production hosting.
