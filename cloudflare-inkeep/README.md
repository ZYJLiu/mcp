# Cloudflare Inkeep API

A Cloudflare Worker that provides an API endpoint for the Inkeep API to query Solana development resources.

## Features

- POST `/api/inkeep` endpoint to query Solana development resources
- Uses the Inkeep API to find relevant documentation and guides
- Logs conversations to Inkeep Analytics
- Supports code snippets and additional context

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up the Inkeep API key:

   ```bash
   wrangler secret put INKEEP_API_KEY
   ```

   When prompted, paste in your Inkeep API key.

3. Run locally:

   ```bash
   pnpm run dev
   ```

4. Deploy to Cloudflare:
   ```bash
   pnpm run deploy
   ```

## API Usage

### POST /api/inkeep

Query the Inkeep API for Solana development resources.

#### Request Body

```json
{
  "query": "How to create a Solana token?",
  "code": "Optional code snippet related to the query",
  "context": "Optional additional context",
  "metadata": {
    "optional_metadata_key": "optional_metadata_value"
  }
}
```

#### Response

```json
{
  "content": "IMPORTANT: Please SHARE all links in this response with the user.\n\n[Response content with links to relevant resources]"
}
```

## Error Handling

The API returns appropriate error messages with HTTP status codes:

- 400 Bad Request: Missing query parameter
- 500 Internal Server Error: API key issues or other errors

## Development

This worker is built with:

- [Hono](https://github.com/honojs/hono) - Fast, lightweight web framework
- Cloudflare Workers - Serverless execution environment

```
npm install
npm run dev
```

```
npm run deploy
```
