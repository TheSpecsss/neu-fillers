# Template Management Backend Server

A TypeScript-based backend server for managing templates and user associations.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database
4. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
5. Update the database configuration in `.env`

## Development

To start the development server:

```bash
npm run dev
```

## Build

To build the project:

```bash
npm run build
```

## Production

To start the production server:

```bash
npm start
```

## Database Schema

### Users Table
- user_id (PK)
- first_name
- last_name
- email
- role_access (99=admin, 98=user)
- created_at

### Templates Table
- template_id (PK)
- template_name
- template_desc
- template_type
- pdf_path
- created_at

### User_Templates Table
- utemplate_id (PK)
- user_id (FK)
- template_id (FK)
- template_config (JSONB)
- created_at

## API Documentation

Coming soon... 