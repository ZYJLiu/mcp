#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

// Create server instance
const server = new McpServer({
  name: "jina",
  version: "1.0.0",
});

const jinaApiKey = process.env.JINA_API_KEY;

// JINA reader tool
server.tool(
  "jina_reader",
  "Use this tool to extract the content from a URL using JINA's reader API. It returns the LLM-parsed text from the URL.",
  {
    url: z
      .string()
      .describe("The URL to extract content from (e.g., https://example.com)"),
  },
  async ({ url }: { url: string }) => {
    if (!jinaApiKey) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Missing JINA API key.",
          },
        ],
      };
    }

    try {
      const jinaReaderUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;

      const response = await fetch(jinaReaderUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jinaApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`JINA reader API returned status ${response.status}`);
      }

      const content = await response.text();

      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        content: [
          {
            type: "text",
            text: `Error fetching content from JINA reader API: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("JINA MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
