# Portfolio Overview

A React dashboard for mortgage portfolio analytics with AI-powered insights.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your OpenAI API keys:
   ```
   # Client-side (Vite) key for direct frontend usage (if enabled)
   VITE_OPENAI_API_KEY=your-api-key-here

   # Server-side key for the Express backend
   OPENAI_API_KEY=your-api-key-here
   ```
   Get your API key from https://platform.openai.com/api-keys

3. Start the development server (Vite):
   ```bash
   npm run dev
   ```
   By default, Vite runs on http://localhost:5173

4. (Optional) Start the Express API server:
   ```bash
   npm run server
   ```
   By default, it runs on http://localhost:3000 (Swagger at http://localhost:3000/api-docs)

## Docker

Build and run with Docker:
```bash
make run
```

Open http://localhost:3000 (Swagger at http://localhost:3000/api-docs)

## Make Commands

| Command | Description |
|---------|-------------|
| `make build` | Build Docker image |
| `make run` | Build and run container |
| `make stop` | Stop and remove container |
| `make clean` | Stop container and remove image |
| `make dev` | Run local dev server |
| `make install` | Install npm dependencies |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run server` - Start the Express API server
