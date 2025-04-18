# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7f7df064-d6b6-45c8-8bfd-e5b26e4ba9f2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7f7df064-d6b6-45c8-8bfd-e5b26e4ba9f2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7f7df064-d6b6-45c8-8bfd-e5b26e4ba9f2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Element Mover App

## Environment Setup

This project consists of multiple components, each with its own environment configuration:

### Frontend (React)
Location: `.env`
- Copy `.env.example` to `.env`
- Configure `VITE_OPENAI_BASE_URL` to point to your proxy server
- Optionally set `VITE_OPENAI_API_KEY` if not using the proxy server

### Proxy Server
Location: `server_proxy/.env`
- Copy `server_proxy/.env.example` to `server_proxy/.env`
- Set `OPENAI_API_KEY` with your OpenRouter API key
- Configure `FRONTEND_URL` to match your frontend URL
- Adjust rate limiting and CORS settings as needed

### Backend Server
Location: `server_backend/.env`
- Copy `server_backend/.env.example` to `server_backend/.env`
- Configure database, JWT, and other settings as needed

## Development Setup

1. Install dependencies:
```bash
# Frontend
npm install

# Proxy Server
cd server_proxy
npm install

# Backend Server
cd server_backend
npm install
```

2. Set up environment variables:
```bash
# Frontend
cp .env.example .env

# Proxy Server
cd server_proxy
cp .env.example .env

# Backend Server
cd server_backend
cp .env.example .env
```

3. Start the services:
```bash
# Frontend
npm run dev

# Proxy Server (in a new terminal)
cd server_proxy
npm run dev

# Backend Server (in a new terminal)
cd server_backend
npm run dev
```

## Environment Variables

### Frontend (.env)
- `VITE_OPENAI_API_KEY`: Optional API key for direct OpenAI access
- `VITE_OPENAI_BASE_URL`: URL of the proxy server
- `VITE_OPENAI_CHAT_MODEL`: Default chat model to use
- `VITE_OPENAI_EMBEDDING_MODEL`: Default embedding model to use

### Proxy Server (server_proxy/.env)
- `OPENAI_API_KEY`: OpenRouter API key
- `OPENAI_BASE_URL`: OpenRouter API URL
- `PORT`: Proxy server port
- `RATE_LIMIT`: Requests per minute limit
- `FRONTEND_URL`: Frontend application URL
- `ALLOWED_ORIGINS`: CORS allowed origins

### Backend Server (server_backend/.env)
- `PORT`: Backend server port
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `ALLOWED_ORIGINS`: CORS allowed origins
