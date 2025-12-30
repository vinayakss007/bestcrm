
# System Design Document: Zenith CRM

This document outlines the system architecture for the Zenith CRM platform, an enterprise-grade, multi-tenant SaaS application. It covers the current state, target architecture, and key design principles for building a robust, scalable, and maintainable system.

## 1. Guiding Principles

*   **Scalability & Performance:** The architecture must support a growing number of tenants and users without degradation in performance.
*   **Security:** Multi-tenancy requires strict data isolation and role-based access control (RBAC) at every layer.
*   **Maintainability:** A clean, well-documented, and modular codebase is essential for long-term development and support.
*   **Developer Experience:** The system should be easy to set up, test, and deploy, enabling rapid feature development.

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

The target is a modern, cloud-native, multi-tenant architecture leveraging serverless technologies for scalability and cost-efficiency. Firebase will serve as the core of our backend.

### 3.1. Frontend Architecture

The frontend will remain a Next.js application but will evolve to be data-driven and stateful.

*   **Data Fetching:** All mock data will be removed. Components will fetch data directly from the Firebase backend using custom hooks (`useDoc`, `useCollection`) that wrap Firebase's real-time SDK.
*   **State Management:** Client-side state will be managed primarily by React's built-in hooks (`useState`, `useReducer`). For complex cross-component state, we will rely on React Context.
*   **Authentication:** User authentication will be handled client-side using the Firebase Authentication SDK. A `useUser` hook will provide the current user's state throughout the app. The UI will dynamically render based on authentication status (e.g., redirecting to a login page if not authenticated).
*   **Component Model:** We will continue to build isolated, reusable components. Pages will be composed of Server Components for static content and Client Components for interactive elements that require state or data fetching.

### 3.2. Backend Architecture

The backend will be built entirely on Google Cloud and Firebase services.

*   **Core Services:**
    *   **Firebase Authentication:** To manage user identity, supporting providers like Google, email/password, and SAML for enterprise clients. Custom claims will be used to manage user roles (`super_admin`, `company_admin`, `user`).
    *   **Firestore:** Our primary database. It will be structured for multi-tenancy.
    *   **Cloud Functions for Firebase:** For all backend business logic, background workers, and API endpoints.

*   **Multi-Tenancy Design (Firestore):**
    *   We will use a **document-based tenancy model**. Every root-level collection will represent a tenant (or "organization").
    *   **Example Structure:** `/organizations/{orgId}/accounts/{accountId}`.
    *   **Security Rules:** Firestore Security Rules will be the cornerstone of data isolation. Rules will ensure that a user can only access data within their own organization (`orgId`). `allow read, write: if request.auth.token.org_id == resource.data.orgId;`

*   **Automation & Background Workers:**
    *   **Cloud Functions** will be used for all asynchronous tasks.
        *   **Event-driven functions:** Triggered by events in Firestore (e.g., `onDocumentCreate`) or Auth (e.g., `onUserCreate`). Use cases: sending welcome emails, creating default records for a new organization.
        *   **Scheduled functions (Pub/Sub):** For recurring tasks like generating weekly reports or cleaning up old data.
        *   **HTTP-triggered functions:** To serve as our secure API endpoints.

*   **APIs, Webhooks, and SDKs:**
    *   **Internal API:** All communication between the frontend and backend will happen via the Firebase SDK (for data) and secure HTTP Cloud Functions (for business logic).
    *   **External API:** We will expose a RESTful API for customer integrations using **API Gateway** fronting HTTP Cloud Functions. API keys and OAuth2 will be used for authentication.
    *   **Webhooks:** We will provide an outbound webhook system. Admins can register URLs to receive notifications on key events (e.g., "opportunity won"). A `webhooks` collection in Firestore will store these configurations, and a Cloud Function will handle the dispatching.
    *   **SDK:** A lightweight JavaScript/TypeScript SDK will be published to NPM to simplify integration with our external API.

### 3.3. DevOps & Infrastructure

*   **Infrastructure as Code (IaC):**
    *   While tools like Ansible are powerful for VM-based infrastructure, our serverless-first approach is better suited for **Terraform** or **Firebase's own configuration files**.
    *   We will use `firebase.json` to define Firestore indexes, Cloud Functions, and Hosting rules.
    *   Terraform can be used to manage Google Cloud projects, API Gateway configurations, and other non-Firebase resources.

*   **CI/CD (Continuous Integration/Continuous Deployment):**
    *   We will use **GitHub Actions**.
    *   **Workflow:**
        1.  `on: push` to `main` branch.
        2.  **Lint & Test:** Run ESLint, Prettier, and Jest/Vitest unit tests.
        3.  **Build:** Build the Next.js application (`next build`).
        4.  **Deploy:**
            *   Deploy the frontend to **Firebase Hosting**.
            *   Deploy Cloud Functions, Security Rules, and Firestore indexes using the Firebase CLI.

*   **Monitoring & Testing:**
    *   **Monitoring:**
        *   **Google Cloud's operations suite (formerly Stackdriver):** Provides logging, monitoring, and alerting for all Cloud Functions and Firebase services out of the box.
        *   We will create custom dashboards to monitor key metrics like function execution time, error rates, and Firestore read/write operations.
        *   Alerts will be configured to notify the development team of anomalies (e.g., a spike in 5xx errors).
    *   **Testing:**
        *   **Unit Tests (Vitest/Jest):** For individual functions and React components.
        *   **Emulator Suite:** Firebase provides a local emulator suite for Auth, Firestore, and Functions. This is critical for testing security rules and function triggers locally without affecting production data.
        *   **End-to-End Tests (Cypress/Playwright):** To simulate user flows in a real browser environment.

---

## 4. Phased Implementation Plan

1.  **Phase 1: Backend Foundation (Current Focus)**
    *   **[DONE]** Design system architecture.
    *   **[NEXT]** Integrate Firebase SDK into the frontend.
    *   **[NEXT]** Implement Authentication (Login, Signup, Logout) and basic RBAC using custom claims.
    *   **[NEXT]** Migrate all mock data to Firestore and refactor components to use live data.

2.  **Phase 2: Core CRM Functionality**
    *   Implement full CRUD (Create, Read, Update, Delete) operations for all CRM objects.
    *   Build out background workers for email notifications.
    *   Refine and deploy robust Firestore Security Rules.

3.  **Phase 3: Enterprise Features**
    *   Build the External API and Webhook system.
    *   Develop and publish the client SDK.
    *   Implement advanced "super admin" features like the Object Manager for custom fields.

This document will be updated as the project evolves.
