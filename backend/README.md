# abetworks crm - Backend

This directory contains the NestJS backend for the abetworks crm application.

## Description

This backend service provides the REST API for all CRM operations, including user authentication, data persistence, and business logic. It is built with [Nest](https://github.com/nestjs/nest), a progressive Node.js framework for building efficient, reliable and scalable server-side applications.

## Getting Started

### Installation

```bash
$ npm install
```

### Running the app (Development)

Requires a local PostgreSQL and Redis instance, typically managed via Docker Compose.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# debug mode
$ npm run start:debug
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
