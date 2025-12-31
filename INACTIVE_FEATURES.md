# Inactive Feature & Action Roadmap

This document lists all the user interface elements that are currently placeholders and do not perform any action. They require backend API endpoints to be built and integrated to become functional.

## Global Actions
- **Header Search Bar**: The main search bar in the header is not functional.
- **User Profile Menu**: The "Profile", "Settings", and "Log out" options in the user dropdown are not wired up.
- **Notifications**: The notification bell shows mock data; it is not connected to a live notification system.

## Dashboard (`/dashboard`)
- **Action Buttons**: The "Add" buttons in the header (if any were configured) are not implemented.
- **Revenue Forecast Chart**: Displays static mock data. Needs to be connected to a live data source from the backend.
- **Recent Activity Feed**: Displays static mock data.

## Accounts (`/accounts`)
- **Add Account Button**: Opens a dialog, but the "Create Account" button inside only logs data to the console.
- **Table Actions (Dropdown Menu)**: The "Edit" and "Delete" options for each account are placeholders.
- **Filtering/Sorting/Columns**: All buttons for filtering, sorting, and managing columns are non-functional UI elements.
- **Export**: The "Export" action in the "More" menu is a placeholder.

## Account Detail Page (`/accounts/[id]`)
- **New Dropdown**: "New Contact", "New Opportunity", "New Task" are placeholders.
- **Edit Button**: Does not do anything.
- **Email/Phone Buttons**: Are not implemented.
- **Delete Button**: Is not implemented.
- **All Tabs (Activity, Contacts, Opportunities, etc.)**: Display static mock data.

## Contacts (`/contacts`)
- **Add Contact Button**: Opens a dialog, but the "Create Contact" button inside only logs data to the console.
- **Table Actions (Dropdown Menu)**: "Edit" and "Delete" are placeholders.
- **Filtering/Sorting/Columns**: All buttons are non-functional UI elements.

## Contact Detail Page (`/contacts/[id]`)
- **New Dropdown**: "Email", "Call", "Task" are placeholders.
- **Edit Button**: Does not do anything.
- **Email/Phone Buttons**: Are not implemented.
- **Delete Button**: Is not implemented.

## Leads (`/leads`)
- **Add Lead Button**: Opens a dialog, but the "Create Lead" button inside only logs data to the console.
- **Table Actions (Dropdown Menu)**: "Edit", "Convert to Opportunity", and "Delete" are all placeholders.
- **Filtering/Sorting/Columns**: All buttons are non-functional UI elements.

## Lead Detail Page (`/leads/[id]`)
- **Convert to Deal Button**: Is not implemented.
- **All Actions (New, Edit, Delete, etc.)**: Are placeholders.
- **Comments Tab**: Adding a comment is not implemented.

## Opportunities (`/opportunities`)
- **Add Opportunity Button**: Opens a dialog, but the "Create Opportunity" button inside only logs data to the console.
- **Table Actions (Dropdown Menu)**: "Edit" and "Delete" are placeholders.
- **Filtering/Sorting/Columns**: All buttons are non-functional UI elements.

## Opportunity Detail Page (`/opportunities/[id]`)
- **All Actions (New Task, Log a Call, Edit, Delete)**: Are placeholders.

## Tasks (`/tasks`)
- **Add Task Button**: Opens a dialog, but the "Create Task" button inside only logs data to the console.
- **Table Actions (Dropdown Menu)**: "Mark as Complete", "Edit", "Delete" are placeholders.

## Invoices (`/invoices`)
- **Create Invoice Button**: Is a placeholder.

## Settings
- All forms in every settings page (`/settings/...`) have "Save" buttons that are not functional. No settings are actually saved.
- **Invite User**: Sending an invitation is not implemented.
- **Custom Fields**: Adding a new custom field is not implemented.
- **Assignment Rules**: Creating a rule is not implemented.
- **Brand Settings**: Uploading logos/favicons is not implemented.
