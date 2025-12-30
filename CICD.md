
# CI/CD Pipeline: Zenith CRM

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) strategy for the Zenith CRM application. The pipeline is managed using **GitHub Actions**.

## 1. Guiding Principles

- **Automation:** Every step, from testing to deployment, is automated to reduce human error and increase speed.
- **Separation of Concerns:** The frontend and backend have separate, independent deployment pipelines. A change to the UI should not require a full backend redeployment, and vice-versa.
- **Consistency:** The use of Docker ensures that the application runs in the exact same environment in development, testing, and production.
- **Safety:** Changes are only deployed to production after passing all automated checks (linting, testing) on the `main` branch.

---

## 2. Frontend Pipeline (Next.js)

- **Trigger:** `on: push` to the `main` branch.
- **Hosting Service:** Vercel or Firebase Hosting.

### Workflow (`.github/workflows/deploy-frontend.yml`)

1.  **Checkout Code:**
    ```yaml
    - name: Checkout Repository
      uses: actions/checkout@v4
    ```

2.  **Setup Node.js:**
    ```yaml
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    ```

3.  **Install Dependencies:**
    ```yaml
    - name: Install Dependencies
      run: npm ci
    ```

4.  **Lint & Type Check:**
    ```yaml
    - name: Run Linter and Type Checker
      run: |
        npm run lint
        npm run typecheck
    ```

5.  **Build Application:**
    ```yaml
    - name: Build Next.js App
      run: npm run build
    ```

6.  **Deploy to Hosting Provider:**
    *   This step will use a provider-specific GitHub Action (e.g., `vercel/deploy-action` or `FirebaseExtended/action-hosting-deploy`).
    ```yaml
    - name: Deploy to Vercel/Firebase
      uses: ...
      with:
        # ... provider-specific credentials and settings
    ```

---

## 3. Backend Pipeline (NestJS)

- **Trigger:** `on: push` to the `main` branch, within the `/backend` directory.
- **Deployment Target:** Google Cloud Run (or a similar container hosting service).
- **Container Registry:** Google Artifact Registry (or Docker Hub).

### Workflow (`.github/workflows/deploy-backend.yml`)

1.  **Checkout Code:** (As above)
2.  **Setup Node.js:** (As above)

3.  **Authenticate to Google Cloud:**
    *   Uses Workload Identity Federation to securely log in without service account keys.
    ```yaml
    - id: 'auth'
      name: 'Authenticate to Google Cloud'
      uses: 'google-github-actions/auth@v2'
      with:
        workload_identity_provider: '...'
        service_account: '...'
    ```

4.  **Lint & Test:**
    ```yaml
    - name: Install Backend Dependencies
      run: cd backend && npm ci
    - name: Run Backend Linter and Tests
      run: |
        cd backend
        npm run lint
        npm run test:unit
        npm run test:e2e
    ```

5.  **Build and Push Docker Image:**
    ```yaml
    - name: Build and Push Docker Image
      run: |-
        docker build --tag="gcr.io/PROJECT_ID/zenith-crm-backend:$GITHUB_SHA" ./backend
        docker push "gcr.io/PROJECT_ID/zenith-crm-backend:$GITHUB_SHA"
    ```

6.  **Deploy to Cloud Run:**
    ```yaml
    - name: Deploy to Cloud Run
      uses: 'google-github-actions/deploy-cloudrun@v2'
      with:
        service: 'zenith-crm-backend'
        region: 'us-central1'
        image: 'gcr.io/PROJECT_ID/zenith-crm-backend:$GITHUB_SHA'
        # ... other settings like environment variables from secrets
    ```
