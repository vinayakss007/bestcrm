# Inactive Feature & Action Roadmap

This document lists all the user interface elements that are currently placeholders and do not perform any action. They require backend API endpoints to be built and integrated to become functional.

## Global Actions
- **User Profile Menu**: The "Log out" option in the user dropdown is not wired up.
- **Notifications**: The notification bell shows mock data; it is not connected to a live notification system.
- **Workspace Switcher**: The workspace switcher in the sidebar is a UI placeholder and does not change the user's context.

## Dashboard (`/dashboard`)
- **Action Buttons**: The "Add" buttons in the header (if any were configured) are not implemented.
- **Revenue Forecast Chart**: Displays static mock data. Needs to be connected to a live data source from the backend.
- **Recent Activity Feed**: Displays static mock data.

## All List Pages (Accounts, Contacts, Leads, Opportunities, Tasks)
- **Search Bar**: The search bar on each list page is a UI placeholder and does not filter results.
- **Filtering Dropdown**: The "Filter" button opens a menu, but the options within do not affect the data shown.
- **Sorting Dropdown**: The "Sort" button opens a menu, but selecting an option does not reorder the data.
- **Columns Button**: The "Columns" button is a UI placeholder.
- **Export Action**: The "Export" action in the "More" menu is a placeholder.

## Add/Create Dialogs
- **All "Add" Dialogs**: The forms for adding new Accounts, Contacts, Leads, Opportunities, and Tasks currently only log data to the console. They do not save data to a database.

## Accounts (`/accounts`)
- **Table Actions (Dropdown Menu)**: The "Edit" and "Delete" options for each account are placeholders.

## Account Detail Page (`/accounts/[id]`)
- **New Dropdown**: "New Contact", "New Opportunity", "New Task" are placeholders.
- **Edit Button**: Does not do anything.
- **Email/Phone Buttons**: Are not implemented.
- **Delete Button**: Is not implemented.
- **All Tabs (Activity, Contacts, Opportunities, etc.)**: Display static mock data.

## Contacts (`/contacts`)
- **Table Actions (Dropdown Menu)**: "Edit" and "Delete" are placeholders.

## Contact Detail Page (`/contacts/[id]`)
- **New Dropdown**: "Email", "Call", "Task" are placeholders.
- **Edit Button**: Does not do anything.
- **Email/Phone Buttons**: Are not implemented.
- **Delete Button**: Is not implemented.

## Leads (`/leads`)
- **Table Actions (Dropdown Menu)**: "Edit", "Convert to Opportunity", and "Delete" are all placeholders.

## Lead Detail Page (`/leads/[id]`)
- **Convert to Deal Button**: Is not implemented.
- **All Actions (New, Edit, Delete, etc.)**: Are placeholders.
- **Comments Tab**: Adding a comment is not implemented.

## Opportunities (`/opportunities`)
- **Table Actions (Dropdown Menu)**: "Edit" and "Delete" are placeholders.

## Opportunity Detail Page (`/opportunities/[id]`)
- **All Actions (New Task, Log a Call, Edit, Delete)**: Are placeholders.

## Tasks (`/tasks`)
- **Table Actions (Dropdown Menu)**: "Mark as Complete", "Edit", "Delete" are placeholders.

## Invoices (`/invoices`)
- **This is a new page and is entirely a placeholder.**
- **Create Invoice Button**: Is a placeholder.
- **Table Actions**: All actions are placeholders.

## Settings
- All forms in every settings page (`/settings/...`) have "Save" buttons that are not functional. No settings are actually saved.
- **Invite User**: Sending an invitation is not implemented.
- **Custom Fields**: Adding a new custom field is not implemented.
- **Assignment Rules**: Creating a rule is not implemented.
- **Brand Settings**: Uploading logos/favicons is not implemented.
