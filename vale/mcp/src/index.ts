import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Create server instance
const server = new McpServer({
  name: "vale",
  version: "1.0.0",
});

// Vale tool
server.tool(
  "vale_lint",
  "Lint text or files using Vale",
  {
    target: z.string().describe("Text content or file path to lint"),
    isFilePath: z
      .boolean()
      .default(false)
      .describe("Whether the target is a file path"),
    options: z.string().optional().describe("Additional vale command options"),
  },
  async ({ target, isFilePath, options = "" }) => {
    let command = "vale";
    let textInput = "";

    if (isFilePath) {
      // If target is a file path, run vale directly on it
      command = `vale ${options} ${target}`;
    } else {
      // If target is text content, use a pipe
      command = `echo "${target.replace(/"/g, '\\"')}" | vale ${options} -`;
      textInput = target;
    }

    try {
      const { stdout, stderr } = await execAsync(command);

      // Vale returns a non-zero exit code when it finds issues, which will throw an error
      // So we handle both successful execution and error conditions here
      return {
        content: [
          {
            type: "text",
            text: stdout || "No issues found!",
          },
        ],
      };
    } catch (error: any) {
      // When Vale finds issues, it will exit with a non-zero code
      // We still want to return the output as that contains the linting results
      if (error.stdout) {
        return {
          content: [
            {
              type: "text",
              text: error.stdout,
            },
          ],
        };
      }

      // For actual errors running the command
      return {
        content: [
          {
            type: "text",
            text: `Error running Vale: ${error.message || "Unknown error"}`,
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
  console.error("Vale MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
