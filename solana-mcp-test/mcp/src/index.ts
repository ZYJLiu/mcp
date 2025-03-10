#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Create server instance
const server = new McpServer({
  name: "solana",
  version: "1.0.0",
});

// Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL =
  "https://cloudflare-inkeep.zyjliu.workers.dev/api/inkeep";

// Define response type for the Cloudflare Worker
interface CloudflareWorkerResponse {
  content: string;
  error?: string;
}

// Inkeep resources tool
server.tool(
  "solana_development_tool",
  "Use this tool for ALL Solana blockchain development related questions. Searches for and provides relevant resources related to Solana development.",
  {
    query: z
      .string()
      .describe(
        "Search query to find relevant resources or code question related to Solana"
      ),
    code: z
      .string()
      .optional()
      .describe(
        "Code snippet to analyze or debug, will be preserved with proper formatting"
      ),
    context: z
      .string()
      .optional()
      .describe(
        "Additional context or conversation history to consider when finding resources"
      ),
    options: z
      .object({
        maxResults: z
          .number()
          .optional()
          .describe("Maximum number of results to return"),
        metadata: z
          .record(z.string())
          .optional()
          .describe("Additional metadata to include with the request"),
      })
      .optional()
      .describe("Optional parameters for the request"),
  },
  async ({ query, code = "", context = "", options = {} }) => {
    try {
      // Prepare request payload for the Cloudflare Worker
      const requestPayload = {
        query,
        code,
        context,
        metadata: options.metadata,
      };

      console.error(
        `Sending request to Cloudflare Worker: ${JSON.stringify(
          requestPayload
        )}`
      );

      // Make a POST request to the Cloudflare Worker
      const response = await fetch(CLOUDFLARE_WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error response: ${errorText}`);
        throw new Error(
          `Cloudflare Worker error: ${response.status} - ${errorText}`
        );
      }

      // Parse the response
      const responseData = (await response.json()) as CloudflareWorkerResponse;

      // Return the content from the Cloudflare Worker
      return {
        content: [
          {
            type: "text",
            text:
              responseData.content ||
              "No resources found. Please try a different query.",
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error calling Cloudflare Worker:", errorMessage);

      // Return the error message directly as the response
      return {
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
        error: errorMessage,
      };
    }
  }
);

// Start the server when this file is run directly
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Solana MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
