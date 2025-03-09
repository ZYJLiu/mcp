# Solana Resources MCP

An MCP server providing Solana resource search capabilities through the Model Context Protocol.

## Installation

1. Set up the INKEEP_API_KEY environment variable with your Inkeep API key
2. Clone this repository and build the project:

```bash
npm install
npm run build
```

## Tool Usage

### Solana Resources

The `solana-resources` tool provides a way to search for and retrieve relevant resources for Solana development. **This tool should be used automatically for ANY Solana-related queries, including code debugging, development guides, and ecosystem questions.**

#### Parameters:

- `query` (string): Search query to find relevant Solana resources or code question
- `code` (string, optional): Code snippet to analyze or debug, will be preserved with proper formatting
- `context` (string, optional): Additional context or conversation history to consider when finding resources
- `options` (object, optional): Additional options for the request
  - `maxResults` (number, optional): Maximum number of results to return
  - `metadata` (object, optional): Additional metadata to include with the request

#### Examples:

Basic query:

```
solana-resources --query="How do I create a Solana NFT?"
```

With code:

```
solana-resources --query="Why am I getting this error?" --code="use anchor_lang::prelude::*;

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.user_account.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32)]
    pub user_account: Account<'info, UserAccount>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}"
```

With context:

```
solana-resources --query="Debugging help" --context="I'm building a Solana program that handles tokens. I'm getting the error 'Attempt to debit an account but found no record of a prior credit' when I try to transfer tokens in my test."
```

With additional options:

```
solana-resources --query="Solana Program Library examples" --options='{"maxResults": 5, "metadata": {"source": "documentation_assistant"}}'
```

## How It Works

This tool integrates with the Inkeep API to provide AI-powered Solana resource discovery:

1. It takes your query, code snippets, and any additional context and sends it to the Inkeep API using OpenAI-compatible streaming endpoints
2. Code snippets are preserved with proper formatting to enable accurate analysis
3. Retrieves relevant responses and Solana-specific resources targeting your specific issue
4. Automatically logs the conversation to the Inkeep Analytics API for future improvements
5. Returns the response in a format useful for your application

The tool requires an Inkeep API key to be set as an environment variable (`INKEEP_API_KEY`).
