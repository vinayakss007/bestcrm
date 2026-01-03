
# Technical Architecture Document: abetworks crm

This document provides a detailed technical blueprint for developers working on the abetworks crm backend. It complements the high-level `DESIGN.md` with implementation specifics.

## 1. Core Technology Stack

- **Runtime:** Node.js (v20 or later)
- **Framework:** **NestJS** (v10 or later) - A progressive, TypeScript-based framework for building scalable server-side applications.
- **Language:** TypeScript
- **Database:** **PostgreSQL** (v15 or later)
- **ORM:** **Drizzle ORM** - A modern, lightweight TypeScript ORM for type-safe database queries.
- **Caching / Job Queue:** **Redis** (v7 or later) - Used for performance caching and managing background jobs with **BullMQ**.
- **Containerization:** **Docker**

## 2. Project Structure (NestJS Backend)

The backend will be a separate monorepo or subdirectory (`/backend`) with a modular structure.

```
/backend
├── src
│   ├── modules
│   │   ├── auth/          # Handles JWT authentication, login, registration
│   │   ├── users/         # Manages CRM users and roles
│   │   ├── accounts/      # CRUD for Accounts
│   │   ├── contacts/      # CRUD for Contacts
│   │   ├── leads/         # CRUD for Leads
│   │   ├── opportunities/ # CRUD for Opportunities
│   │   ├── invoices/      # CRUD for Invoices
│   │   └── ... (etc.)
│   ├── core/            # Core services, guards, interceptors for multi-tenancy
│   ├── db/
│   │   ├── schema.ts      # Drizzle ORM schema (Source of Truth)
│   │   └── migrations/    # SQL migration files
│   ├── shared/          # Shared utilities, DTOs, constants
│   ├── main.ts          # Application entry point
│   └── app.module.ts    # Root application module
├── test/
│   ├── *.spec.ts        # Unit tests
│   └── *.e2e-spec.ts    # End-to-end tests
├── Dockerfile
└── ... (config files)
```

## 3. Data Model & Multi-Tenancy

The entire system is designed as a **multi-tenant application**, ensuring that data for each client organization is strictly isolated.

- **Schema Definition:** The single source of truth for the database schema is `/backend/src/db/schema.ts`. This file uses Drizzle ORM to define all tables, columns, and relationships.
    - **`organizations` Table:** This is the root table. All other data is scoped to an organization.
    - **`organization_id` Foreign Key:** Every major CRM table (`crmAccounts`, `crmLeads`, etc.) contains an `organization_id` column. All database queries **MUST** be filtered by the `organization_id` of the authenticated user to prevent data leakage.
- **Migrations:** Database migrations will be handled by `drizzle-kit`. Developers will run `drizzle-kit generate:pg` to create SQL migration files based on changes to `schema.ts`.
- **Soft Deletes:** Core CRM tables use a soft-delete mechanism (`is_deleted` flag and `deleted_at` timestamp). This prevents accidental permanent data loss and allows for data recovery.
- **Custom Fields:** All core CRM objects include a `customFields: jsonb` column. This allows for storing dynamic, user-defined data without altering the table structure.

## 4. API Design (RESTful)

- **API Specification:** The API is formally defined in the **OpenAPI specification** located at `/docs/openapi.yaml`. All development MUST adhere to this contract.
- **Versioning:** The API will be versioned (e.g., `/api/v1/...`).
- **Authentication:** All endpoints will be protected by a JWT-based authentication guard (`AuthGuard`). The JWT payload will include `userId` and, critically, the `organizationId`. This `organizationId` is used to scope all database queries.
- **Data Transfer Objects (DTOs):** All incoming request bodies will be validated against DTOs using NestJS's built-in `ValidationPipe`.
- **Webhook Endpoints:** Dedicated endpoints will be created (e.g., `/api/v1/webhooks/forms`) to ingest data from external sources like website forms. These endpoints will require an API key and an associated `organizationId` to correctly route incoming leads.

## 5. User Roles & Permissions

- **Roles:** The system defines several roles (e.g., `user`, `company-admin`, `super-admin`) stored in the `crmUsers.role` column.
- **Guards:** NestJS Guards will be used to enforce role-based access control (RBAC) on sensitive endpoints. For example, creating a new user might be restricted to `company-admin`.

## 6. Local Development Setup

1.  **Prerequisites:** Docker and Docker Compose must be installed.
2.  **Configuration:** Create a `.env` file in the `/backend` directory with connection strings for PostgreSQL and Redis.
3.  **Launch:** Run `docker-compose up -d`.
4.  **Database Migration:** Run `npm run db:migrate` to apply the latest database schema.

## 7. Next Steps: Connecting Frontend to Backend

1.  **Build the Backend:** A development team will use the `openapi.yaml` and `backend/src/db/schema.ts` as a guide to build the NestJS backend, implementing the user authentication and CRUD API endpoints.
2.  **Generate a Client SDK:** The frontend team will use the OpenAPI specification to auto-generate a type-safe TypeScript client.
3.  **Replace Mock Data:** Systematically replace all mock data calls in `src/lib/actions.ts` with calls to the newly generated SDK, making the application fully functional.
