
# Technical Architecture Document: Zenith CRM

This document provides a detailed technical blueprint for developers working on the Zenith CRM backend. It complements the high-level `DESIGN.md` with implementation specifics.

## 1. Core Technology Stack

- **Runtime:** Node.js (v20 or later)
- **Framework:** **NestJS** (v10 or later) - A progressive, TypeScript-based framework for building scalable server-side applications.
- **Language:** TypeScript
- **Database:** **PostgreSQL** (v15 or later)
- **ORM:** **Drizzle ORM** - A modern, lightweight TypeScript ORM for type-safe database queries.
- **Caching / Job Queue:** **Redis** (v7 or later) - Used for performance caching and managing background jobs with a library like BullMQ.
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
- **Authentication:** All endpoints will be protected by a JWT-based authentication guard (`AuthGuard`). The JWT will be passed in the `Authorization` header (`Bearer <token>`). The token payload will include `userId` to scope all database queries.
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

## 5. Monitoring & Observability

A production application cannot run "blind." A robust monitoring strategy is essential for maintaining system health, diagnosing issues, and ensuring performance.
- **Logging:** All NestJS application logs will be structured as JSON and sent to a centralized logging service (e.g., Google Cloud Logging, Datadog). This allows for powerful searching and filtering of log data across all services.
- **Metrics (Prometheus / Grafana):** The backend application will expose a `/metrics` endpoint compatible with Prometheus. We will track key application metrics, including:
    - `http_requests_total`: Total number of API requests.
    - `http_requests_duration_seconds`: Latency of API requests.
    - `http_requests_errors_total`: Count of 5xx and 4xx errors.
    - `db_query_duration_seconds`: Performance of database queries.
- **Alerting:** Grafana or Alertmanager will be configured to send alerts to a team chat channel (e.g., Slack) if key metrics cross predefined thresholds (e.g., "API p95 latency is over 500ms for 5 minutes").
- **Health Checks:** A dedicated `/healthz` endpoint will be implemented to report the status of the service and its dependencies (e.g., database connection).

## 6. Local Development Setup

1.  **Prerequisites:** Docker and Docker Compose must be installed.
2.  **Configuration:** Create a `.env` file in the `/backend` directory with connection strings for PostgreSQL and Redis.
3.  **Launch:** Run `docker-compose up -d`. This will start containers for:
    *   The NestJS application (with hot-reloading for development).
    *   A PostgreSQL database.
    *   A Redis instance.
4.  **Database Migration:** Run `npm run db:migrate` to apply the latest database schema.

## 7. Next Steps: Connecting Frontend to Backend

1.  **Build the Backend:** A development team will use the `openapi.yaml` and `src/lib/schema.ts` as a guide to build the NestJS backend, implementing the user authentication and CRUD API endpoints.
2.  **Generate a Client SDK:** The frontend team will use the OpenAPI specification at `/docs/openapi.yaml` to auto-generate a type-safe TypeScript client for the API.
3.  **Replace Mock Data:** Systematically replace all mock data calls in `src/lib/actions.ts` with calls to the newly generated SDK, wiring up the UI to the live backend API. This will make all UI components (forms, charts, tables) fully functional.
