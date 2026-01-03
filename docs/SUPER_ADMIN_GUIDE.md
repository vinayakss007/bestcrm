# Super Admin Guide: abetworks crm

This document is a guide for the **Super Admin**, the platform owner with global access and control over the entire abetworks crm application. It explains how to use the exclusive features available only to this role.

The Super Admin tools are located under the **Settings -> System** section of the application.

## 1. Tenant Management

As a Super Admin, you have the ability to view and manage all the customer organizations (tenants) that have signed up for the platform.

### Viewing All Tenants
- **Location:** `Settings -> System -> Tenants`
- **Functionality:** This page displays a table of all organizations registered on the platform. For each organization, you can see:
    - **Organization Name:** The name of the tenant company.
    - **User Count:** The number of users belonging to that organization.
    - **Created At:** The date the organization was created.

This view is essential for understanding your customer base and monitoring platform growth.

## 2. User Management & Impersonation

While Company Admins can manage users within their own organization, the Super Admin has a global view of all users across all tenants.

### Viewing All Users
- **Location:** `Settings -> Team -> Users`
- **Functionality:** The user list for a Super Admin includes an additional **Organization** column, allowing you to see which tenant each user belongs to.

### User Impersonation
- **Why it's important:** User impersonation is a critical support and debugging tool. It allows you to temporarily "log in as" another user to see the application exactly as they see it. This is invaluable for troubleshooting issues, verifying permissions, and providing effective customer support without needing to ask for the user's password.
- **How to use it:**
    1. Navigate to the **Users** settings page.
    2. Find the user you wish to impersonate in the table.
    3. Click the "More" actions menu (three dots) at the end of the user's row.
    4. Select the **Impersonate** option.
    5. You will be logged in as that user and redirected to their dashboard. A banner at the top of the screen will indicate that you are in an impersonation session.
    6. To end the session, click the "End Impersonation" button in the banner.

**Security Note:** This feature is restricted by the `super-admin:tenant:impersonate` permission and is only available to Super Admins. All impersonation actions should be considered sensitive and used only for legitimate support and administrative purposes.

## 3. System Health Monitoring

The Super Admin is responsible for the overall health and stability of the platform.

- **Location:** `Settings -> System -> System Status`
- **Functionality:** This page provides a real-time status check of the CRM's critical services.
    - **Backend API:** Confirms that the main NestJS application server is running and responsive.
    - **Database Connection:** Actively tests the connection to the PostgreSQL database by running a live query.
    - **Other Services:** Displays the status of other key components, like the AI agent service and email delivery.
- **Usage:** If users report issues, this page should be your first stop to quickly diagnose whether a core system component is down or experiencing issues.

## 4. Global Audit Trail

The audit log provides a chronological, unalterable record of all significant actions taken by all users across all tenants.

- **Location:** `Settings -> System -> Audit Log`
- **Functionality:** This page displays a detailed log of activities, including:
    - Which user performed the action.
    - What the action was (e.g., "created account 'ABC Corp'").
    - The exact time the action occurred.
- **Why it's important:** The audit log is crucial for:
    - **Security:** Identifying suspicious or unauthorized activity.
    - **Compliance:** Providing a record of data access and modification for auditing purposes.
    - **Debugging:** Tracing the sequence of events that led to an error or unexpected data state.
