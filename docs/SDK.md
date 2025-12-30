
# abetworks crm Client SDK

This document outlines the process for generating and using a client-side SDK for the abetworks crm API.

## 1. Overview

To provide a robust and type-safe developer experience, we automatically generate a TypeScript client SDK directly from our `openapi.yaml` specification. This ensures that the frontend can interact with the backend API without manual `fetch` calls, and with full type-checking and autocompletion in modern IDEs.

## 2. Generating the SDK

The SDK is generated using the [OpenAPI Generator CLI](https://openapi-generator.tech/).

### Prerequisites

- Java (required by the generator)
- Node.js and npm

### Generation Command

From the root of the project, run the following command:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i ./docs/openapi.yaml \
  -g typescript-fetch \
  -o ./src/lib/sdk \
  --additional-properties=typescriptThreePlus=true,supportsES6=true
```

This command will:
- Read the API contract from `/docs/openapi.yaml`.
- Generate a TypeScript client using the `typescript-fetch` generator.
- Place the generated code into the `/src/lib/sdk` directory.

This process should be re-run whenever the `openapi.yaml` specification is updated.

## 3. Using the SDK in the Frontend

Once generated, the SDK can be imported and used within our Next.js application (e.g., in Server Actions or client-side hooks).

### Example Usage (`/src/lib/actions.ts`)

```typescript
// src/lib/actions.ts
'use server'

import { Configuration, AccountsApi } from '@/lib/sdk';

// Configure the API client
// In a real application, the accessToken would be retrieved from the user's session.
const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_URL,
  accessToken: 'user-jwt-token-here',
});

const accountsApi = new AccountsApi(config);

/**
 * Fetches all accounts using the generated SDK.
 */
export async function getAccounts() {
  try {
    const accounts = await accountsApi.getAccounts();
    return accounts;
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    // In a real app, you would handle this error more gracefully.
    return [];
  }
}

/**
 * Creates a new account using the generated SDK.
 * @param accountData - The data for the new account.
 */
export async function createAccount(accountData: import('@/lib/sdk').CreateAccountDto) {
  try {
    const newAccount = await accountsApi.createAccount({ createAccountDto: accountData });
    // Revalidate cache or perform other actions after mutation
    return newAccount;
  } catch (error) {
    console.error("Failed to create account:", error);
    throw new Error("Could not create account.");
  }
}
```

This approach provides a clean, maintainable, and type-safe way for the frontend to communicate with the backend, significantly improving developer velocity and reducing runtime errors.
