# abetworks crm Documentation

Welcome to the central documentation hub for the abetworks crm application. This directory contains all the technical, user, and operational guides for the project.

## 1. Getting Started

If you are new to the project, start here.

- **[Project Overview](./PROJECT_OVERVIEW.md):** A high-level summary of the project's architecture, features, and technology stack.

---

## 2. User & Admin Guides

These documents are intended for the people who will be using and managing the CRM application.

- **[User Guide](./USER_GUIDE.md):** A guide for end-users (e.g., Sales Reps, Company Admins) explaining how to use the CRM's features, such as managing leads, accounts, and opportunities.
- **[Super Admin Guide](./SUPER_ADMIN_GUIDE.md):** A guide for the platform owner, detailing how to use the Super Admin features like tenant management, system health monitoring, and user impersonation.

---

## 3. Developer & Technical Documentation

This section contains all the technical information needed for developers working on the project.

- **[System Design](./DESIGN.md):** The high-level strategic overview of the system's architecture.
- **[Backend Architecture](./ARCHITECTURE.md):** Detailed technical specifications for the NestJS backend, including the multi-tenant data model, project structure, and local development setup.
- **[Frontend Architecture & Implementation](./PROJECT_OVERVIEW.md#2-frontend-architecture--implementation):** A breakdown of the Next.js frontend structure and approach.
- **[Database Schema Definition (`/backend/src/db/schema.ts`)]:** The single source of truth for the PostgreSQL database schema, written in Drizzle ORM syntax.
- **[API Specification (`openapi.yaml`)]:** The complete OpenAPI v1 contract for the backend REST API.

---

## 4. Operational & DevOps Guides

This section covers deployment, maintenance, and troubleshooting.

- **[CI/CD Pipeline](./CICD.md):** An outline of the automated build, test, and deployment pipelines for both the frontend and backend using GitHub Actions.
- **[Troubleshooting Guide](./TROUBLESHOOTING.md):** A critical document for debugging common issues, interpreting errors, and resolving problems across the stack.

---

## 5. Project Management & Roadmap

These documents track the project's progress and future plans.

- **[Enterprise Roadmap](./ENTERPRISE_ROADMAP.md):** Outlines the features and architectural enhancements required to scale the application to an enterprise-grade platform.
- **[Implementation Checklist](./CHECKLIST.md):** Tracks the progress of the core CRM build.
- **[Enterprise Checklist](./ENTERPRISE_CHECKLIST.md):** Tracks the progress of the advanced enterprise features.
- **[Inactive Features](./INACTIVE_FEATURES.md):** A list of UI elements that are currently placeholders and require backend integration.
