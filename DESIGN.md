
# System Design Document: Zenith CRM

This document outlines the system architecture for the Zenith CRM platform, an enterprise-grade, multi-tenant SaaS application. It covers the current state, target architecture, and key design principles for building a robust, scalable, and maintainable system.

## 1. Guiding Principles

*   **Scalability & Performance:** The architecture must support a growing number of tenants and users without degradation in performance.
*   **Security:** Multi-tenancy requires strict data isolation and role-based access control (RBAC) at every layer.
*   **Maintainability:** A clean, well-documented, and modular codebase is essential for long-term development and support.
*   **Developer Experience:** The system should be easy to set up, test, and deploy, enabling rapid feature development.
*   **API-First:** All core functionality should be exposed through a secure, well-documented API to enable integrations and an ecosystem.
*   **Reliability & Redundancy:** Leverage cloud-native patterns and managed services to ensure high availability and automatic backups.

---

## 2. Current State (As-Is)

The application currently exists as a **frontend-only Next.js application**.

*   **Framework:** Next.js 14+ with the App Router.
*   **UI:** React with TypeScript, styled using Tailwind CSS and ShadCN UI components.
*   **Data:** All data is mocked and stored in static TypeScript files (`src/lib/data.ts`). There is no backend database, and data is not persistent.
*   **State:** The application is stateless. Any changes made by the user are lost on page refresh.
*   **Authentication:** None. The application is fully public.
*   **Deployment:** None. The application is run in a local development environment.

**Conclusion:** The current state serves as a high-fidelity prototype and UI component library. The foundational business logic, data persistence, and security layers are yet to be built.

---

## 3. Target Architecture (To-Be)

The target is a modern, cloud-native, multi-tenant architecture featuring a dedicated server backend for maximum control and performance, connected to a data-driven Next.js frontend.

### 3.1. Frontend Architecture

The frontend will remain a Next.js application but will evolve to communicate with our dedicated backend API.

*   **Data Fetching:** All mock data will be removed. Components will fetch data from our backend REST API using a library like `SWR` or `React Query` for efficient caching, revalidation, and state management.
*   **State Management:** Client-side state will be managed primarily by React's built-in hooks (`useState`, `useReducer`). For complex cross-component state and data caching, we will rely on React Context in conjunction with `SWR` or `React Query`.
*   **Authentication:** User authentication will be handled via the backend API using JWT (JSON Web Tokens). A custom `useUser` hook will manage the user's session state and provide user information throughout the app. The UI will dynamically render based on authentication status.
*   **Component Model:** We will continue to build isolated, reusable components. Pages will be composed of Server Components for static content and Client Components for interactive elements that require state or data fetching.

### 3.2. Backend Architecture

The backend will be a standalone, dedicated **NestJS** application written in **TypeScript**. This provides a scalable, modular, and maintainable server architecture.

*   **Framework:** **NestJS**. Its modular structure, dependency injection, and use of TypeScript make it ideal for a large-scale enterprise application.
*   **Primary Database:** **PostgreSQL**. A robust, open-source relational database that provides strong data consistency, transactional integrity, and powerful querying capabilities, all of which are essential for a CRM.
*   **Authentication:** **Passport.js** will be used as middleware within NestJS to handle authentication strategies. We will implement a JWT-based strategy for stateless, secure API authentication. User roles and permissions will be managed within our own database.
*   **API:** The NestJS application will expose a comprehensive **RESTful API**. This API will be the single source of truth for all data and business logic, serving the Next.js frontend and any future external clients. All endpoints will be secured and will enforce role-based access control (RBAC).

*   **Multi-Tenancy Design:**
    *   We will use a **schema-per-tenant** or **discriminator column** strategy. A `companyId` or `orgId` column will be present on all relevant database tables.
    *   All API endpoints and service-layer logic in the backend will be scoped to the currently authenticated user's organization, ensuring strict data isolation at the application level. Database policies can be used for an additional layer of security.

*   **Automation & Background Workers:**
    *   We will use a dedicated job queue system like **BullMQ**, backed by **Redis**, for all asynchronous tasks.
    *   **Use Cases:** Sending welcome emails, processing large data imports/exports, generating reports, or any long-running task that should not block the main API response.
    *   These workers will run as separate processes, ensuring the API remains responsive.

*   **External APIs, Webhooks, and SDKs:**
    *   **External API:** We will expose a subset of our internal REST API for customer integrations. We will use a tool like **Google Cloud API Gateway** or an equivalent to manage API keys, rate limiting, and public documentation.
    *   **Webhooks:** An outbound webhook system will be built. Admins can register URLs to receive notifications on key events (e.g., "opportunity won"). A dedicated module in our NestJS app will handle the logic for dispatching these events securely and reliably.
    *   **SDK:** A lightweight JavaScript/TypeScript SDK will be published to NPM to simplify integration with our external API.

### 3.3. DevOps & Infrastructure

*   **Containerization:** The entire NestJS backend application (including background workers) will be containerized using **Docker**. This ensures consistency across all environments, from local development to production.
*   **Infrastructure as Code (IaC):** We will use **Terraform** to define and manage all our cloud infrastructure, including our PostgreSQL database instance (e.g., Google Cloud SQL), Redis instance, Kubernetes cluster, and networking rules. This makes our infrastructure version-controlled, repeatable, and easy to manage.
*   **CI/CD (Continuous Integration/Continuous Deployment):**
    *   We will use **GitHub Actions**.
    *   **Workflow:**
        1.  `on: push` to `main` branch.
        2.  **Lint & Test:** Run ESLint, Prettier, and Jest/Vitest unit and integration tests for both the frontend and backend.
        3.  **Build:**
            *   Build the Next.js application (`next build`).
            *   Build the Docker image for the NestJS backend.
        4.  **Deploy:**
            *   Deploy the Next.js frontend to **Firebase Hosting** or **Vercel**.
            *   Push the backend Docker image to a container registry (e.g., Google Artifact Registry).
            *   Trigger a rolling update of our backend service (e.g., on Google Cloud Run or Kubernetes).

*   **Monitoring & Testing:**
    *   **Monitoring:** We will integrate a comprehensive monitoring solution like **Datadog** or use Google Cloud's built-in **Operations Suite**. We will create dashboards to monitor API latency, error rates (4xx/5xx), database query performance, and background job throughput. Alerts will be configured to notify the development team of anomalies.
    *   **Testing:**
        *   **Unit Tests (Jest):** For individual functions, components, and NestJS services/controllers.
        *   **Integration Tests:** To test the interaction between different modules of our NestJS application.
        *   **End-to-End Tests (Cypress/Playwright):** To simulate complete user flows in a real browser, from the frontend UI to the backend API and database. We will use a dedicated test database for these tests.

---

## 4. Phased Implementation Plan

1.  **Phase 1: Backend Foundation (Current Focus)**
    *   **[DONE]** Design system architecture.
    *   **[NEXT]** Set up the NestJS project structure with modules for users, authentication, and core CRM objects.
    *   **[NEXT]** Implement JWT-based authentication (Login, Signup, Logout) and basic RBAC.
    *   **[NEXT]** Integrate the Next.js frontend with the new backend API for authentication and data fetching, removing all mock data.

2.  **Phase 2: Core CRM Functionality**
    *   Implement full CRUD (Create, Read, Update, Delete) API endpoints for all CRM objects.
    *   Build out the background worker system for email notifications and other async tasks.
    *   Refine and deploy robust database schemas and application-level security policies.

3.  **Phase 3: Enterprise Features**
    *   Build and document the External API and Webhook system.
    *   Develop and publish the client SDK.
    *   Implement advanced "super admin" features like the Object Manager for custom fields.

This document will be updated as the project evolves.
