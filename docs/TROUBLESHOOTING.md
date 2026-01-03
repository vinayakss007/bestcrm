# Troubleshooting & Debugging Guide

This document provides guidance for developers and administrators on how to diagnose and resolve common issues within the abetworks crm application.

## 1. General Approach to Debugging

When a user reports an issue, follow these steps to narrow down the problem:

1.  **Check the Browser's Developer Console:** Look for any JavaScript errors, failed network requests (e.g., HTTP 4xx or 5xx status codes), or CORS errors. This is the fastest way to identify frontend or API communication problems.
2.  **Check the System Status Page:** As a Super Admin, navigate to `Settings -> System -> System Status`. This gives you a quick, real-time check on the health of the Backend API and Database Connection.
3.  **Check the Audit Log:** Navigate to `Settings -> System -> Audit Log` to see the sequence of recent actions. This can help you understand the steps a user took that led to the issue.
4.  **Check the Backend Server Logs:** If the issue seems to be on the server-side (e.g., an HTTP 500 error), inspect the logs from the NestJS backend process. These logs will contain detailed error messages and stack traces. You can view these via your container hosting provider (e.g., Google Cloud Run logs) or by running the backend locally (`npm run start:dev` in the `/backend` directory).
5.  **Impersonate the User:** If the issue seems to be related to permissions or is specific to a user's account, use the Super Admin's **Impersonate** feature to see the application from their perspective.

---

## 2. Common Issues and Solutions

### Issue: User cannot log in.

- **Symptom:** User enters credentials and sees a "Login failed" or "Invalid credentials" error.
- **Possible Causes & Solutions:**
    1.  **Incorrect Password:** The most common cause. Advise the user to try again or use the "Forgot Password" feature (if implemented).
    2.  **Incorrect Email / User Not Found:** The user may be entering the wrong email or their account may not exist. A Super Admin can verify the user's email in the `Settings -> Users` table.
    3.  **Deactivated User:** The user's account may have been soft-deleted or deactivated. A developer will need to check the `is_deleted` flag for that user in the `crm_users` database table.
    4.  **Backend API Down:** Check the **System Status** page. If the API is down, the login request will fail. Investigate the backend server logs for the cause of the outage.

### Issue: Pages are not loading data, or actions are failing.

- **Symptom:** Tables are empty, forms won't submit, or an error toast appears saying "An unexpected error occurred."
- **Possible Causes & Solutions:**
    1.  **API Endpoint Error (HTTP 500):** Check the browser's network tab. If a request is failing with a 500-level error, the problem is on the backend. Examine the NestJS server logs for a detailed stack trace. This often points to a bug in a service, a database query failure, or a configuration issue.
    2.  **Authorization Error (HTTP 403 Forbidden):** The user's role does not have the required permission to perform the action. A Super Admin can verify and adjust the user's role and permissions in `Settings -> Roles & Permissions`. You can also use the **Impersonate** feature to confirm the permission issue.
    3.  **Data Not Found (HTTP 404):** The API endpoint is trying to fetch a resource that doesn't exist or doesn't belong to the user's organization. This is usually expected behavior, but if the resource *should* exist, it may indicate a problem with how the ID is being passed from the frontend.
    4.  **CORS Error:** A Cross-Origin Resource Sharing error in the browser console indicates a misconfiguration between the frontend and backend URLs. Ensure the `FRONTEND_URL` environment variable in the backend's `.env` file exactly matches the domain of the running frontend application.

### Issue: File uploads are failing.

- **Symptom:** User tries to upload a file, but it fails with an error message.
- **Possible Causes & Solutions:**
    1.  **File Size Limit:** The default file size limit may be too small. This is configured in the `multer` setup in `backend/src/modules/attachments/attachments.controller.ts`.
    2.  **Permissions on `uploads` Directory:** The backend server process needs write permissions for the `/backend/uploads` directory. If running in Docker, ensure the volume or directory permissions are set correctly.
    3.  **Static Asset Serving:** The NestJS application must be configured to serve static assets from the `uploads` directory. Verify this configuration exists in `backend/src/main.ts` (`app.useStaticAssets`).

### Issue: New users cannot register.

- **Symptom:** A user fills out the registration form but sees an error.
- **Possible Causes & Solutions:**
    1.  **Database Connection Failure:** The `signUp` process involves multiple database transactions. If the database is unreachable, registration will fail. Check the **System Status** page and backend logs.
    2.  **Email Conflict (HTTP 409):** The user is trying to register with an email that already exists in the system.
    3.  **Initial Super Admin Creation:** The very first registration triggers a special setup process. If this fails, subsequent registrations may also fail. A developer may need to manually seed the database by running `npm run db:seed` in the `/backend` directory to ensure the foundational roles and permissions exist.
