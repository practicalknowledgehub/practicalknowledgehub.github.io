# Temporary customer tracker (development only)

This branch is separate from main. No customer names or locations are committed.

## Security requirements
- GitHub Pages is public. Do not add the customer spreadsheet, CSV, names, locations, passwords, or tokens to this branch or the public site.
- An unlisted URL and noindex are **not** access controls.
- Use an organization-approved private data store and authenticated application, allowing only Vijayabaskar, Vineeth, Abhinav, and Cibi's authorized accounts.
- Verify that the bank's information-security policy permits the chosen hosting/storage before importing any records.

## Intended private app
- Search by customer name or location
- Staff selection (Vijayabaskar, Vineeth, Abhinav, Cibi)
- One completion checkbox per customer and explicit Submit
- Server-side validation, timestamp and duplicate-submission protection
- Completed / Pending filters and export to CSV
- Restrict writes to authenticated authorized users; staff dropdown alone is not authentication

## Deployment
1. Build/deploy the restricted backend and private interface in an approved environment.
2. Test simultaneous submissions, identity restrictions, export, and data retention.
3. Set AUTHENTICATED_TRACKER_URL in customer-tracker.html to the verified authenticated HTTPS app URL.
4. Publish only the public landing page after approval; do not merge sensitive data into main.
5. After approximately seven days, export and verify a backup, revoke access, remove the landing page, disable the backend, and delete temporary copies according to policy.

The landing page deliberately does not display or store customer records and is not a functional tracker until the private backend is deployed.
