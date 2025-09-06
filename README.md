# Auto Budget Tracker (WIP)

Auto Budget Tracker is a Go-based backend service designed to help users import, categorise, and manage their financial transactions. It supports CSV imports, automatic transaction categorisation, and storage in Google Firestore.

## Features

- CRUD operations for transactions via HTTP API.
- Bulk CSV import of transactions.
- Automatic transaction categorisation using keyword mapping.
- Google Firestore as the backend database.
- Dockerised for easy deployment.

## Endpoints
- GET /health – Health check
- POST /transactions – Create a transaction
- GET /transactions/{id} – Get a transaction by ID
- GET /transactions – List all transactions
- PUT /transactions/{id} – Update a transaction
- DELETE /transactions/{id} – Delete a transaction
- POST /transactions/import – Bulk import transactions from CSV
