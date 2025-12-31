# Project Overview: abetworks crm

This document provides a comprehensive summary of the technical architecture, development roadmap, and operational strategy for the abetworks crm application. It consolidates information from all project documentation into a single guide.

---

## 1. High-Level System Design

The system is architected as two distinct, independently deployable applications: a **Next.js Frontend** and a **NestJS Backend**. This separation of concerns allows for independent development, scaling, and deployment cycles.

- **`DESIGN.md`**: Contains the high-level strategic overview.
- **`ARCHITECTURE.md`**: Contains detailed backend technical specifications.
- **`CICD.md`**: Outlines the automated deployment pipelines.

---

## 2. Frontend Architecture & Implementation

The frontend is a modern web application responsible for all user interface rendering and client-side interactivity. It is currently a fully-featured, responsive UI prototype with mock data.

### 2.1. Frontend Technology Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** React with TypeScript
- **UI Components:** ShadCN UI
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form with Zod for validation
- **Deployment:** Vercel or Firebase Hosting

### 2.2. Frontend Project Structure
- **`/src/app/(app)`**: Main application routes (Dashboard, Accounts, Leads, etc.).
- **`/src/components`**: Reusable React components, including dialogs, forms, and UI elements.
- **`/src/lib`**: Core logic, mock data (`data.ts`), and action placeholders (`actions.ts`).
- **`/src/lib/actions.ts`**: Contains placeholder functions (e.g., `getAccounts`) that currently return mock data. This file is where live API calls will be integrated.

---

## 3. Backend Architecture & Implementation

The backend is a standalone server application responsible for all business logic, data persistence, and secure API access. It is designed to be built based on the provided specifications.

### 3.1. Backend Technology Stack
- **Runtime:** Node.js (v20+)
- **Framework:** NestJS (v10+)
- **Language:** TypeScript
- **Database:** PostgreSQL (v15+)
- **ORM:** Drizzle ORM for type-safe database queries.
- **Caching & Job Queue:** Redis (v7+) with **BullMQ** for background jobs.
- **Containerization:** Docker

### 3.2. Data Model & Database Schema
The complete database schema is the single source of truth, defined in:
- **`src/lib/schema.ts`**: Contains all table definitions (`crmUsers`, `crmAccounts`, `crmLeads`, `crmInvoices` etc.) using Drizzle ORM syntax for PostgreSQL.

### 3.3. API Design & Contract
The REST API is formally defined and serves as the contract between the frontend and backend.
- **`docs/openapi.yaml`**: A complete OpenAPI 3.0 specification for all v1 endpoints (e.g., `GET /accounts`, `POST /accounts`). It defines all request/response structures and DTOs.
- **`docs/SDK.md`**: Provides instructions for auto-generating a type-safe TypeScript client SDK from the OpenAPI specification, which will be used by the frontend.

### 3.4. Monitoring & Observability
The backend is designed for production-readiness with a full monitoring stack:
- **Logging:** Structured JSON logs for centralized analysis.
- **Metrics:** A `/metrics` endpoint for Prometheus to scrape key application metrics (request latency, errors).
- **Alerting:** Grafana/Alertmanager for automated alerts on metric thresholds.
- **Health Checks:** A `/healthz` endpoint to report service status.

---

## 4. CI/CD & Deployment Strategy

The project uses GitHub Actions for automated, independent deployments of the frontend and backend.

### 4.1. Backend CI/CD Pipeline
Defined in **`.github/workflows/deploy-backend.yml`**.
- **Trigger:** On push to `main` branch affecting the `/backend` directory.
- **Steps:**
  1.  Install dependencies (`npm ci`).
  2.  Run Linter & Tests (Unit, Integration, E2E).
  3.  Build a Docker image.
  4.  Push the image to a container registry (e.g., Google Artifact Registry).
  5.  Deploy the image to a container service (e.g., Google Cloud Run).

### 4.2. Frontend CI/CD Pipeline
Defined in a future `.github/workflows/deploy-frontend.yml` (as specified in `CICD.md`).
- **Trigger:** On push to `main` branch.
- **Steps:**
  1.  Install dependencies (`npm ci`).
  2.  Run Linter, Type Checker, and Tests.
  3.  Build the Next.js application (`npm run build`).
  4.  Deploy to a static hosting provider (e.g., Vercel).

---

## 5. Complete Implementation Roadmap

This is the actionable "to-do list" for the development teams.

### 5.1. Backend Roadmap
1.  **Setup & Auth:**
    - [ ] Initialize NestJS project in a `/backend` directory.
    - [ ] Use Docker for local PostgreSQL/Redis.
    - [ ] Run `drizzle-kit` to apply the schema from `src/lib/schema.ts`.
    - [ ] Build the user authentication module to issue JWTs.
2.  **Core API Implementation:**
    - [ ] Build all CRUD endpoints for `Accounts`, `Contacts`, `Leads`, `Opportunities`, `Tasks`, and `Invoices` as defined in `docs/openapi.yaml`.
3.  **Finalize & Deploy:**
    - [ ] Integrate Redis for caching and BullMQ for background jobs.
    - [ ] Write unit and integration tests for all modules.
    - [ ] Configure and activate the deployment pipeline in `deploy-backend.yml`.

### 5.2. Frontend Roadmap
1.  **API Integration:**
    - [ ] Generate the client SDK from the live backend's OpenAPI spec.
    - [ ] Implement the login UI and JWT session management.
2.  **Connect UI to Live Data:**
    - [ ] Replace mock `console.log` in all "Add/Edit" dialogs with SDK mutation calls (e.g., `sdk.createAccount()`).
    - [ ] Replace mock data returns in `src/lib/actions.ts` with SDK query calls (e.g., `sdk.getAccounts()`) to populate tables and dashboards.
    - [ ] Implement live search, sort, and filter functionality by adding query parameters to SDK calls.
3.  **Finalize & Deploy:**
    - [ ] Write E2E tests (e.g., using Playwright) to simulate user flows.
    - [ ] Configure and activate the frontend deployment pipeline.
