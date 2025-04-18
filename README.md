# NEU Filler

A full-stack application for managing templates

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)
- OpenRouter API key

## Project Structure

```
element-mover-app/
├── frontend/          # React frontend application
├── server_proxy/      # Proxy server for OpenAI API
└── server_backend/    # Backend server with database
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd element-mover-app
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

#### Frontend Environment Variables (.env)
- `VITE_OPENAI_BASE_URL`: URL of the proxy server (default: http://localhost:3001)
- `VITE_OPENAI_API_KEY`: Optional API key for direct OpenAI access
- `VITE_OPENAI_CHAT_MODEL`: Default chat model to use
- `VITE_OPENAI_EMBEDDING_MODEL`: Default embedding model to use

### 3. Proxy Server Setup

```bash
# Navigate to proxy server directory
cd server_proxy

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start proxy server
npm run dev
```

#### Proxy Server Environment Variables (server_proxy/.env)
- `OPENAI_API_KEY`: Your OpenRouter API key
- `OPENAI_BASE_URL`: OpenRouter API URL (default: https://openrouter.ai/api/v1)
- `PORT`: Proxy server port (default: 3001)
- `RATE_LIMIT`: Requests per minute limit (default: 60)
- `FRONTEND_URL`: Frontend application URL (default: http://localhost:5173)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

### 4. Backend Server Setup

```bash
# Navigate to backend server directory
cd server_backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start backend server
npm run dev
```

#### Backend Server Environment Variables (server_backend/.env)
- `PORT`: Backend server port (default: 3002)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)

### 5. Database Setup

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in `server_backend/.env` with your database credentials
3. Run database migrations (if applicable)

## Development Workflow

1. Start the frontend server:
```bash
npm run dev
```

2. Start the proxy server (in a new terminal):
```bash
cd server_proxy
npm run dev
```

3. Start the backend server (in a new terminal):
```bash
cd server_backend
npm run dev
```

## Production Deployment

For production deployment, ensure to:
1. Set appropriate environment variables for production
2. Use HTTPS for all services
3. Configure proper CORS settings
4. Set up proper rate limiting
5. Use secure JWT secrets
6. Configure proper database backups

## Troubleshooting

- If you encounter CORS issues, verify the `ALLOWED_ORIGINS` settings in both proxy and backend servers
- For database connection issues, verify the `DATABASE_URL` format and credentials
- If the proxy server fails to connect to OpenRouter, verify your API key and base URL
- For frontend issues, check the browser console and network tab for errors
