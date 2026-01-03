# Enterprise Build Checklist

This checklist tracks the implementation progress of the features and technical improvements outlined in the `ENTERPRISE_ROADMAP.md` document, required to evolve the CRM into a scalable, enterprise-grade platform.

## Pillar 1: Product Evolution (Advanced Features)

### 1.1. Advanced Role-Based Access Control (RBAC)
- [x] **DB Schema:** Create `crm_roles`, `crm_permissions`, and `crm_role_permissions` tables.
- [x] **Backend API:** Build API endpoints for Company Admins to manage custom roles.
- [x] **Backend Logic:** Refactor NestJS Guards to use the new dynamic permission system.
- [x] **Frontend UI:** Build the "Roles & Permissions" settings page for Company Admins.

### 1.2. Customizable Dashboards & Reporting
- [ ] **Backend API:** Implement a `ReportsModule` for defining, saving, and executing custom reports.
- [ ] **Frontend UI (Dashboard):** Implement a drag-and-drop grid system for dashboard widgets.
- [ ] **Frontend UI (Report Builder):** Create an interface for users to build and save their own reports.

### 1.3. Workflow Automation Engine
- [ ] **Backend Service:** Implement a `WorkflowModule` to define and store `Trigger -> Condition -> Action` rules.
- [ ] **Backend Architecture:** Integrate an event-driven system (e.g., NestJS Events or BullMQ) to emit events on record changes.
- [ ] **Backend Processor:** Create a listener service to process workflow rules based on events.
- [ ] **Frontend UI:** Build a "Workflow Rules" page in Settings for Company Admins.

### 1.4. Third-Party Integrations
- [ ] **Backend Auth:** Implement OAuth2 strategies (Passport.js) for Google and Microsoft.
- [ ] **Backend Service:** Create services to interact with third-party APIs (e.g., Google Calendar, Outlook).
- [ ] **Frontend UI:** Display integrated data (e.g., emails, calendar events) on relevant CRM record pages.

---

## Pillar 2: Platform Management (Super Admin Tooling)

### 2.1. Tenant Management Dashboard
- [x] **Backend API:** Create Super Admin endpoints to list, view, and manage tenant organizations.
- [x] **Backend API:** Implement a user impersonation feature for support purposes.
- [x] **Frontend UI:** Build a dedicated "Super Admin" section in the application.
- [x] **Frontend UI:** Develop the tenant list and detail views for the Super Admin.

### 2.2. Global Analytics & Health Monitoring
- [x] **Backend Instrumentation:** Integrate a metrics solution (e.g., Prometheus) into key backend services.
- [ ] **Data Architecture:** Set up a separate analytics database to log platform-wide events.
- [ ] **Frontend UI:** Build a global health and analytics dashboard for the Super Admin (e.g., using Grafana or a custom UI).

---

## Pillar 3: Technical Foundation & Scalability

### 3.1. Backend Enhancements
- [x] **Job Queue:** Integrate BullMQ and Redis to process background jobs (e.g., CSV exports, bulk emails).
- [x] **Pagination:** Implement API-level pagination (offset or cursor-based) for all list endpoints.
- [ ] **Security Hardening:** Enforce environment variables for all secrets.
- [ ] **Security Hardening:** Implement strict CORS policies and API rate limiting.

### 3.2. Frontend Enhancements
- [ ] **E2E Testing:** Set up a testing framework (Playwright or Cypress).
- [ ] **E2E Testing:** Write test suites for all critical user journeys (e.g., auth, lead conversion).
- [ ] **State Management:** Introduce a client-side state library (e.g., Zustand) for complex, interactive UIs like the report builder.
- [x] **Frontend Pagination:** Update all list pages to correctly handle and display paginated data from the API.
