
# CRM Build Checklist

This checklist tracks the implementation progress based on the `docs/CRM_SYSTEM_GUIDE.md`.

## Phase 1: Foundation & Architecture
- [x] Set up the core project structure (Next.js + NestJS).
- [x] Design the database schema with tenant isolation (`tenant_id`).
- [ ] Implement a `Tenant` model/table (`organizations`).
- [ ] Create a middleware layer for "Tenant Awareness".
- [ ] Implement a data access layer that automatically filters queries by `tenant_id`.

## Phase 2: User & Role System
- [x] Create a `User` model with a `role` field.
- [x] Implement a relationship between `User` and `Tenant` (`organizationId`).
- [ ] Build the backend authorization logic (RBAC).
- [ ] Develop user management interfaces for the Company Admin.

## Phase 3: Core CRM Modules
- [ ] Build the **Leads Module** (backend & frontend).
- [ ] Build the **Contacts & Companies Module** (backend & frontend).
- [ ] Build the **Sales Pipeline Module** (backend & frontend).
- [ ] Build the **Invoicing Module** (backend & frontend).
- [ ] Develop a unified, role-specific **Dashboard**.

## Phase 4: Settings & Finalization
- [ ] Build the three-layered **Settings Module** (Super Admin, Company Admin, User).
- [x] Implement Monitoring & Maintenance UI for the Super Admin (`System Status`, `Audit Log`).
- [ ] Conduct a final security audit.
- [ ] Package the application for deployment.

## Critical Components Checklist

### Core Functionality
- [ ] **User Onboarding & Tenant Provisioning**: Self-service and manual signup flows.
- [ ] **Authentication & Identity Management**: Secure login, password reset, 2FA.
- [ ] **Email & Notification Engine**: Transactional emails and real-time in-app notifications.
- [ ] **File & Document Management**: Secure file uploads on records.
- [ ] **Activity Timeline & Audit Trail**: Per-record and global activity logs.
- [ ] **Data Import / Export**: CSV import/export functionality.
- [ ] **API & Webhooks**: RESTful API with keys and outbound webhooks.

### UI/UX & Polish
- [ ] **UI/UX Polish & Accessibility**: Fully responsive design, dark/light mode, accessibility (a11y).
- [ ] **Documentation & Support**: In-app help center and public API docs.

### DevOps & Production Readiness
- [ ] **Testing Strategy**: Comprehensive unit, integration, and E2E tests.
- [ ] **Monitoring & Logging**: Centralized logging and real-time monitoring dashboards.
- [ ] **Deployment Pipeline**: Zero-downtime deployment strategy (Blue-Green).
- [ ] **Billing & Subscription Management**: Integration with Stripe/Braintree.
- [ ] **Legal & Compliance**: GDPR tooling, privacy policy, cookie consent.
- [ ] **Backup & Disaster Recovery**: Automated daily backups with point-in-time recovery.
