# Enterprise CRM Roadmap: Scaling for Mass-Market Success

This document provides a critical system design review of the abetworks CRM. It outlines the essential features, architectural enhancements, and technical debt that must be addressed to evolve the application from a functional MVP into an enterprise-grade SaaS platform ready for thousands of users and mass-market sales.

---

## 1. Executive Summary

The current application is a well-architected, feature-complete MVP. It successfully demonstrates core multi-tenant CRM functionality with a clean separation of frontend and backend concerns.

To achieve enterprise readiness, the focus must now shift from adding core features to building for **scale, customization, administration, and integration**. The following roadmap details the three key pillars of work required:
1.  **Product Evolution:** Implementing advanced, high-value features expected by enterprise customers.
2.  **Platform Management:** Empowering the Super Admin to manage, monitor, and grow the SaaS business.
3.  **Technical Foundation:** Addressing architectural shortcuts and scaling the backend for high performance and reliability under heavy load.

---

## 2. Essential Enterprise Features (Product Roadmap)

To be competitive at a large scale, the CRM must move beyond basic CRUD and offer powerful customization and automation.

### 2.1. Advanced Role-Based Access Control (RBAC)
- **Problem:** The current role system (`user`, `company-admin`) is too rigid. Enterprise clients need to define their own roles and permission sets.
- **Solution:**
    1.  **Database Schema Extension:** Create `crm_roles`, `crm_permissions`, and `crm_role_permissions` tables.
    2.  **Backend Implementation:** Build an API for Company Admins to create, edit, and assign custom roles.
    3.  **Refactor Guards:** Update all NestJS Guards to check permissions based on the user's role and the new granular permission system, rather than a hardcoded enum check.
    4.  **Frontend UI:** Build a "Roles & Permissions" page in the Settings area for Company Admins.

### 2.2. Customizable Dashboards & Reporting Engine
- **Problem:** Dashboards are currently static. Enterprise users need to build, save, and share their own reports and dashboard layouts.
- **Solution:**
    1.  **Backend Service:** Create a new `ReportsModule` that allows users to define reports (e.g., "Leads by Source this Quarter") and save them as JSON configurations. The service will execute the necessary database queries.
    2.  **Frontend UI:**
        - Implement a drag-and-drop dashboard interface (e.g., using a library like `react-grid-layout`).
        - Build a "Report Builder" UI that allows users to select metrics, group-bys, and date ranges.

### 2.3. Workflow Automation Engine
- **Problem:** The system lacks automation. Users cannot create rules like "If a lead status is changed to 'Qualified', automatically create a task for the owner."
- **Solution:**
    1.  **Backend "Workflow" Service:** Implement a service that allows users to define `Trigger -> Condition -> Action` rules.
    2.  **Event-Driven Architecture:** Use NestJS Events or a message queue. When a record is updated (e.g., `lead.service.ts`), emit an event like `lead.updated`.
    3.  **Workflow Processor:** A listener service will catch these events, check them against saved workflow rules, and execute the corresponding actions (e.g., call `task.service.ts` to create a task).

### 2.4. Third-Party Integrations (Email & Calendar)
- **Problem:** The CRM is an island. It needs to connect to the tools users already use.
- **Solution:**
    1.  **OAuth2 Integration:** Implement Passport.js strategies for Google and Microsoft to securely connect user accounts. Store OAuth tokens in the database.
    2.  **Service Layer:** Create services to interact with Google/Microsoft Graph APIs for reading emails and calendar events.
    3.  **UI Integration:** Display related emails and events on Contact and Lead detail pages.

---

## 3. Super Admin & Platform Management

To run this as a business, the Super Admin needs tools to manage tenants and monitor the platform.

### 3.1. Tenant Management Dashboard
- **Problem:** The Super Admin has no central place to view or manage customer organizations (tenants).
- **Solution:**
    1.  **New Frontend Module:** Create a "Super Admin" section in the UI, visible only to users with the `super-admin` role.
    2.  **Backend API:** Build endpoints for the Super Admin to:
        - List all organizations with key metrics (user count, data usage).
        - Impersonate a user within a tenant for support purposes.
        - Manually provision or disable a tenant account.

### 3.2. Global Analytics & Platform Health
- **Problem:** The current health check is basic. The Super Admin cannot see platform-wide usage patterns or identify performance bottlenecks.
- **Solution:**
    1.  **Metrics Service:** Integrate a metrics solution like Prometheus. Instrument key backend services to track API response times, database query performance, and error rates.
    2.  **Analytics Database:** Use a separate analytics database (e.g., ClickHouse, Druid) to log key events (user logins, records created) without impacting the primary application DB performance.
    3.  **Super Admin Dashboard:** Build dashboards (e.g., using Grafana) to visualize these metrics, providing insights into platform health and user engagement.

---

## 4. Addressing Technical Debt & Scalability

The current MVP contains shortcuts that must be addressed for performance, reliability, and security at scale.

### 4.1. Backend
- **Implement a Robust Job Queue:**
    - **Debt:** There is no job queue. CPU-intensive tasks like exporting a large CSV file will block the main server thread, degrading performance for all users.
    - **Fix:** Integrate **BullMQ** with **Redis**. Refactor services like `accounts.service.ts`'s `export` method to offload the CSV generation to a background worker process. This ensures the API remains responsive.
- **Introduce API Pagination:**
    - **Debt:** List endpoints (e.g., `GET /accounts`) fetch all records at once. This will not scale and will crash with thousands of records.
    - **Fix:** Implement cursor- or offset-based pagination in all `findAll` methods in the backend services. The frontend will need to be updated to handle paginated responses.
- **Fortify Security:**
    - **Debt:** The JWT secret is hardcoded by default. CORS is wide open (`enableCors()`).
    - **Fix:**
        - Enforce the use of environment variables for all secrets (`JWT_SECRET`, `DATABASE_URL`).
        - Configure CORS to be restrictive, only allowing requests from the known frontend domain.
        - Implement rate limiting on the API to prevent abuse.

### 4.2. Frontend
- **End-to-End (E2E) Testing:**
    - **Debt:** There are no E2E tests.
    - **Fix:** Implement a testing suite using a framework like **Playwright** or **Cypress**. Create test cases for critical user flows like "User Registration," "Lead Conversion," and "Create Account."
- **State Management:**
    - **Debt:** The frontend relies heavily on Server Actions and `revalidatePath` for state management, which can be inefficient for complex, highly interactive pages.
    - **Fix:** For complex UIs like the proposed dashboard editor or workflow builder, introduce a client-side state management library (like **Zustand** or **Jotai**) to manage UI state without requiring a full server roundtrip for every interaction.
