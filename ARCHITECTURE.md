
# Technical Architecture Document: Zenith CRM

This document provides a detailed technical blueprint for developers working on the Zenith CRM backend. It complements the high-level `DESIGN.md` with implementation specifics.

## 1. Core Technology Stack

- **Runtime:** Node.js (v20 or later)
- **Framework:** **NestJS** (v10 or later) - A progressive, TypeScript-based framework for building scalable server-side applications.
- **Language:** TypeScript
- **Database:** **PostgreSQL** (v15 or later)
- **ORM:** **Drizzle ORM** - A modern, lightweight TypeScript ORM for type-safe database queries.
- **Caching / Job Queue:** **Redis** (v7 or later)
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
│   │   └── ... (etc.)
│   ├── core/            # Core services, guards, interceptors
│   ├── shared/          # Shared utilities, DTOs, constants
│   ├── main.ts          # Application entry point
│   └── app.module.ts    # Root application module
├── test/
│   ├── *.spec.ts        # Unit tests
│   └── *.e2e-spec.ts    # End-to-end tests
├── Dockerfile
└── ... (config files)
```

## 3. Data Model & ORM

- **Schema Definition:** The single source of truth for the database schema is `/src/lib/schema.ts` in the frontend project. This file uses Drizzle ORM to define all tables, columns, and relationships. The backend will reference this schema.
- **Migrations:** Database migrations will be handled by `drizzle-kit`. Developers will run `drizzle-kit generate:pg` to create SQL migration files based on changes to `schema.ts`, and then apply them to the database.
- **Custom Fields:** All core CRM objects (`crmAccounts`, `crmContacts`, etc.) include a `customFields: jsonb` column. This allows for storing dynamic, user-defined data without altering the table structure, providing essential flexibility for an enterprise CRM.

## 4. API Design (RESTful)

- **API Specification:** The API is formally defined in the **OpenAPI specification** located at `/docs/openapi.yaml`. This document is the single source of truth for all endpoints, request payloads, and response structures. All development MUST adhere to this contract.
- **Versioning:** The API will be versioned (e.g., `/api/v1/...`).
- **Authentication:** All endpoints will be protected by a JWT-based authentication guard (`AuthGuard`). The JWT will be passed in the `Authorization` header (`Bearer <token>`). The token payload will include `userId` and `orgId` to scope all database queries.
- **Data Transfer Objects (DTOs):** All incoming request bodies will be validated against DTOs using NestJS's built-in `ValidationPipe`. These DTOs are defined in the OpenAPI specification.
- **Responses:**
    - `200 OK`: Successful `GET`, `PUT`, `PATCH`.
    - `201 Created`: Successful `POST`.
    - `204 No Content`: Successful `DELETE`.
    - `400 Bad Request`: Validation error (response body will include details).
    - `401 Unauthorized`: Missing or invalid JWT.
    - `403 Forbidden`: User does not have permission for the action.
    - `404 Not Found`: Resource not found.
    - `500 Internal Server Error`: Server-side error.

## 5. Local Development Setup

1.  **Prerequisites:** Docker and Docker Compose must be installed.
2.  **Configuration:** Create a `.env` file in the `/backend` directory with connection strings for PostgreSQL and Redis.
3.  **Launch:** Run `docker-compose up -d`. This will start containers for:
    *   The NestJS application (with hot-reloading for development).
    *   A PostgreSQL database.
    *   A Redis instance.
4.  **Database Migration:** Run `npm run db:migrate` to apply the latest database schema.

## 6. Next Steps: Building the Backend

1.  **Initialize NestJS Project:** Set up the NestJS project with the structure defined above.
2.  **Implement Auth Module:** Build the authentication module with Passport.js to handle user registration and login, issuing JWTs upon success.
3.  **Implement Accounts Module:** Create the `AccountsController`, `AccountsService`, and `AccountsModule`. Implement full CRUD (Create, Read, Update, Delete) functionality, using Drizzle ORM for database queries. Ensure all service methods are scoped by the user's organization ID from the JWT.
4.  **Repeat for Other Modules:** Continue implementing the remaining CRM modules (Contacts, Leads, etc.) following the same pattern.
