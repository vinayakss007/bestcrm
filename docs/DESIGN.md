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

### Phase 2: Backend Implementation (Complete)
This phase involved building the core backend logic according to the `openapi.yaml` specification.

- **[DONE]** **User Authentication:** Implemented the user registration and login endpoints.
- **[DONE]** **Core CRUD APIs:** Implemented all API endpoints for Accounts, Contacts, Leads, Opportunities, Tasks, Invoices, Comments, and Attachments, ensuring all database queries are strictly scoped by `organizationId`.
- **[DONE]** **Advanced Features:** Implemented role-based access control (RBAC), activity logging, and file upload handling.

### Phase 3: Frontend Integration (Complete)
This phase involved replacing all mock data with live API calls.

- **[DONE]** **API Integration:** All mock data has been replaced with live API calls via Next.js Server Actions.
- **[DONE]** **Connect UI to Data:**
    - All "Add/Edit" forms and dialogs are fully functional and save data.
    - All list pages feature live search, sorting, and filtering.
    - The main dashboard is fully dynamic.
    - All detail pages are connected to live data, including comments and attachments.

### Phase 4: Final Polish & Deployment (Next)
1.  **Testing:** Write comprehensive unit, integration, and end-to-end tests for both the frontend and backend.
2.  **Deployment:** Configure and activate the CI/CD pipelines in `.github/workflows/` to deploy the applications to production hosting.
