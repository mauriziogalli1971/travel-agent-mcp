
# Travel Agent MCP

An AI-powered travel agent application utilizing the Model Context Protocol (MCP). This repository contains the complete stack including a React frontend, an MCP client, and a serverless MCP server deployed on Cloudflare Workers.

## Project Structure

- **app/**: React frontend application (Vite).
- **mcp-client/**: MCP client implementation for consuming the agent tools.
- **mcp-server/**: The MCP server implementation running on Cloudflare Workers, providing the core travel agent logic and tools.

## Prerequisites

- Node.js (v20 or later)
- npm
- Cloudflare account (for server deployment)
- Supabase account (for persistence)

## Getting Started

### 1. MCP Server

The server handles the core logic and integrations.
```
bash
cd mcp-server
npm install
```
**Development:**
```
bash
npm run mcp-server-mcp-dev
```
**Deployment:**
```
bash
npm run mcp-server-deploy
```
**Code Quality:**
```
bash
# Format code
npm run format

# Lint and fix issues
npm run lint:fix

# Type checking
npm run type-check
```
### 2. MCP Client

The client connects to the MCP server.
```
bash
cd mcp-client
npm install
# Add start scripts as defined in mcp-client/package.json
```
### 3. Frontend App

The user interface for the travel agent.
```
bash
cd app
npm install
npm run dev
```
## Tech Stack

- **Runtime:** Node.js, Cloudflare Workers
- **Language:** TypeScript, JavaScript
- **Frameworks:** React, Vite, Wrangler
- **Libraries:**
    - `agents`: For agentic patterns.
    - `zod`: For schema validation.
    - `@supabase/supabase-js`: For database interactions.
- **Tooling:** Biome (linting/formatting), Vitest (testing).

## License

MIT License