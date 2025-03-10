# JINA Reader MCP Tool

An MCP server providing access to the JINA Reader API through the Model Context Protocol. This tool allows you to extract content from web pages using JINA's reader service.

## Cursor

```bash
JINA_API_KEY=your_api_key_here npx jina-mcp
```

## Claude Desktop

```json
{
  "mcpServers": {
    "jina-reader": {
      "command": "npx",
      "args": ["jina-mcp"],
      "env": {
        "JINA_API_KEY": ""
      }
    }
  }
}
```

## Tool Usage

### JINA Reader

The `jina_reader` tool extracts content from web pages using JINA's reader service.

#### Parameters:

- `url` (string): The URL to extract content from (e.g., https://example.com)

#### Examples:

Basic usage:

```
jina_reader --url="https://solana.com/docs/core/accounts"
```

## How It Works

This tool integrates with the JINA Reader API to provide content extraction:

1. It takes a URL and sends it to the JINA Reader API
2. The API processes the web page and extracts the relevant content
3. The extracted content is returned in a structured format
