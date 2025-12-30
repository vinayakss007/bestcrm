
# System Design Document: Zenith CRM

This document provides a high-level overview of the system architecture for the Zenith CRM platform. For detailed technical specifications, please refer to the following documents:

- **[Technical Architecture (`ARCHITECTURE.md`)](./ARCHITECTURE.md):** For developers. Details the backend stack, project structure, data models, and local setup.
- **[CI/CD Pipeline (`CICD.md`)](./CICD.md):** For DevOps. Outlines the automated build, test, and deployment pipelines for frontend and backend.

## 1. Guiding Principles

*   **Scalability & Performance:** The architecture must support a growing number of tenants and users without degradation in performance.
*   **Security:** Multi-tenancy requires strict data isolation and role-based access control (RBAC) at every layer.
*   **Maintainability:** A clean, well-documented, and modular codebase is essential for long-term development and support.
*   **API-First:** All core functionality is exposed through a secure, versioned REST API.
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

## 3. Next Steps & Implementation Plan

With the foundational architecture and documentation in place, the immediate next step is to **build the backend**.

1.  **Phase 1: Backend Foundation (Current Focus)**
    *   **[DONE]** Design system architecture and create documentation.
    *   **[DONE]** Define the complete PostgreSQL database schema (`src/lib/schema.ts`).
    *   **[NEXT]** Initialize the NestJS backend project.
    *   **[NEXT]** Implement the Authentication module (user registration, login) to issue JWTs.
    *   **[NEXT]** Begin implementing the `Accounts` CRUD module in the backend.
    *   **[NEXT]** Connect the Next.js frontend's "Add Account" feature to the new live backend API endpoint.

2.  **Phase 2: Core CRM Functionality**
    *   Implement full CRUD API endpoints for all remaining CRM objects (Leads, Contacts, etc.).
    *   Wire up the corresponding frontend pages to use the live backend APIs, completely removing all mock data.
    *   Build out the background worker system for email notifications.

3.  **Phase 3: Enterprise Features**
    *   Build and document the External API and Webhook system.
    *   Implement "super admin" features for managing custom fields.
