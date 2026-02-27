
# Travel Agent MCP

An AI-powered travel agent application utilizing the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). This repository contains the complete stack including a React frontend, an MCP client, and a serverless MCP server deployed on Cloudflare Workers.

## 🚀 Overview

The **Travel Agent MCP** is designed to assist users with travel planning. It leverages MCP to provide a standardized way for AI models (via the MCP client) to interact with specialized travel tools (via the MCP server).

- **MCP Server**: Provides tools for flights, hotels, weather, and airport information.
- **MCP Client**: Orchestrates interactions between an LLM (OpenAI) and the MCP server.
- **Frontend App**: A user-friendly React interface for interacting with the travel agent.

## 📁 Project Structure

This repository is an npm monorepo with the following structure:

- `app/`: React frontend application (Vite).
- `mcp-server/`: MCP server implementation running on Cloudflare Workers.
- `mcp-client/`: MCP client implementation (consumes server tools and talks to OpenAI).
- `packages/`: Shared packages used across the project (`@travel-agent/shared`).
  - `domain/`: Core types and error definitions.
  - `http/`: HTTP utility functions and error mapping.
  - `logging/`: Structured logging utilities.
  - `utils/`: General helper functions and validators.

## 🛠 Tech Stack

- **Runtime**: Node.js (v20+), Cloudflare Workers.
- **Language**: TypeScript.
- **Frontend**: React, Vite.
- **Backend/MCP**: Wrangler (Cloudflare), MCP SDK.
- **AI/LLM**: OpenAI SDK.
- **Persistence**: Supabase.
- **External APIs**: OpenWeather, SerpAPI.
- **Tooling**: Biome (linting & formatting), ESLint, TypeScript.

## 📋 Prerequisites

- **Node.js**: v20 or later.
- **npm**: v10 or later (configured as the package manager).
- **Cloudflare Account**: For deploying and running Workers.
- **Supabase Account**: For database/persistence.
- **API Keys**: Required for OpenAI, OpenWeather, and SerpAPI.

## ⚙️ Setup & Installation

From the root directory:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create `.env` files in `mcp-server/` and `mcp-client/`.

    **`mcp-server/.env`**:
    ```env
    SUPABASE_URL="your_supabase_url"
    SUPABASE_API_KEY="your_supabase_api_key"
    OPENWEATHER_API_KEY="your_openweather_api_key"
    SERPAPI_API_KEY="your_serpapi_api_key"
    ```

    **`mcp-client/.env`**:
    ```env
    OPENAI_API_KEY="your_openai_api_key"
    MCP_SERVER_URL="http://localhost:8788/mcp" # Adjust if server is remote
    CF_AI_GATEWAY="https://api.openai.com/v1" # Or Cloudflare AI Gateway URL
    ```

## 🚀 Running the Project

### 1. Start the MCP Server
```bash
cd mcp-server
npm run mcp-server-dev
```
The server will run locally using Wrangler (defaults to `http://localhost:8788`).

### 2. Start the MCP Client
```bash
cd mcp-client
npm run mcp-client-dev
```

### 3. Start the Frontend App
```bash
cd app
npm run app-dev
```
The app will be available at `http://localhost:5173`.

## 📜 Scripts

### Root Scripts
- `npm install`: Install dependencies for all workspaces.

### MCP Server (`mcp-server/`)
- `mcp-server-dev`: Start local development server with Wrangler.
- `mcp-server-deploy`: Deploy the server to Cloudflare Workers (production).
- `format`: Format code using Biome.
- `lint:fix`: Lint and fix issues using Biome.
- `cf-typegen`: Generate Cloudflare Worker types.
- `type-check`: Run TypeScript type checking.

### MCP Client (`mcp-client/`)
- `mcp-client-dev`: Start local development client.
- `mcp-client-deploy`: Deploy the client to Cloudflare.
- `format`: Format code using Biome.
- `lint:fix`: Lint and fix issues using Biome.
- `cf-typegen`: Generate types for Cloudflare.
- `type-check`: Run TypeScript type checking.

### Frontend App (`app/`)
- `app-dev`: Start Vite development server.
- `build`: Build the application for production.
- `lint`: Run ESLint.
- `preview`: Preview the production build locally.

## ✅ Testing & Quality

- **Linting & Formatting**: Handled by Biome in server/client and ESLint in the app.
- **Type Checking**: Run `npm run type-check` in relevant directories.
- **TODO**: Add automated test suites (e.g., Vitest) as the project matures.

## 📄 License

This project is licensed under the [MIT License](LICENSE.txt).