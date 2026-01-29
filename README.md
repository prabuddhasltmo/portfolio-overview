# Portfolio Overview

A React dashboard for mortgage portfolio analytics with AI-powered insights.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your-api-key-here
   ```
   Get your API key from https://platform.openai.com/api-keys

3. Start the development server:
   ```bash
   npm run dev
   ```

## Docker

Build and run with Docker:
```bash
make run
```

Open http://localhost:8080

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
