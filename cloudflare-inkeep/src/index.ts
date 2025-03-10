import { Hono } from "hono";

interface InkeepRequest {
  query: string;
  code?: string;
  context?: string;
  metadata?: Record<string, string>;
}

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
  return c.text("Inkeep API Endpoint Running");
});

// POST /api/inkeep endpoint to call the Inkeep API
app.post("/api/inkeep", async (c) => {
  try {
    const apiKey = c.env.INKEEP_API_KEY;

    if (!apiKey) {
      return c.json({ error: "Missing Inkeep API key" }, 500);
    }

    const requestData = await c.req.json<InkeepRequest>();
    const { query, code, context, metadata } = requestData;

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    try {
      // Format code with proper indentation and markdown markers if provided
      const formattedCode = code ? "```solana\n" + code + "\n```\n\n" : "";

      // Create a prompt to search for Solana resources
      const prompt = `Find the most relevant resources, documentation, and guides for the following Solana-related query: ${query}

${formattedCode}${
        code
          ? "Above is the code snippet related to the query. Please analyze it and provide relevant resources or solutions.\n\n"
          : ""
      }${
        context
          ? `Additional context provided by the user:\n${context}\n\n`
          : ""
      }
Instructions:
1. Focus on providing official and high-quality resources for Solana developers.
2. Include direct links to documentation, code examples, and learning materials where relevant.
3. Categorize resources when possible (official docs, tutorials, tools, etc.).
4. Be comprehensive but prioritize the most relevant resources first.
5. If specific technical topics are mentioned in the query, provide specialized resources for those topics.
6. If code snippets are provided, give resources that specifically address the code issues or implementation details.
7. For error messages, include troubleshooting guides or references to similar issues and solutions.`;

      // Make a direct fetch request instead of using the OpenAI client
      const response = await fetch(
        "https://api.inkeep.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "inkeep-qa-sonnet-3-5",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Inkeep API error: ${response.status}`);
      }

      // Parse the response
      interface InkeepApiResponse {
        choices: Array<{
          message?: {
            content: string;
          };
        }>;
      }

      const responseData = (await response.json()) as InkeepApiResponse;
      const content = responseData.choices[0]?.message?.content || "";

      // Add a message to share links with the user
      const responseWithLinkInstructions =
        "IMPORTANT: Please SHARE all links in this response with the user.\n\n" +
        content;

      // Log the conversation to Inkeep Analytics after completion
      try {
        await logConversationToInkeep(apiKey, query, content, metadata);
      } catch (logError) {
        console.error("Failed to log conversation to Inkeep:", logError);
      }

      return c.json({
        content:
          responseWithLinkInstructions ||
          "No resources found. Please try a different query.",
      });
    } catch (apiError) {
      const errorMessage =
        apiError instanceof Error ? apiError.message : "Unknown API error";

      console.error("Error processing request:", errorMessage);

      return c.json(
        {
          error: `Error retrieving Solana resources: ${errorMessage}`,
        },
        500
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return c.json(
      {
        error: `Error calling Inkeep API: ${errorMessage}`,
      },
      500
    );
  }
});

// Log conversation to Inkeep Analytics API
async function logConversationToInkeep(
  apiKey: string,
  query: string,
  aiResponse: string,
  metadata?: Record<string, string>
) {
  try {
    const conversationData = {
      type: "openai",
      messages: [
        {
          role: "user",
          content: query,
        },
        {
          role: "assistant",
          content: aiResponse,
        },
      ],
      properties: {
        source: "cloudflare_worker",
        ...metadata,
      },
    };

    const response = await fetch(
      "https://api.analytics.inkeep.com/conversations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conversationData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to log conversation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error logging conversation to Inkeep:", error);
    return null;
  }
}

export default app;
