# Solana MCP Test

A testing MCP server providing Solana resource search capabilities through the Model Context Protocol, using a Cloudflare Worker proxy.

## Cursor

Command:

```
npx solana-mcp-tool
```

## Claude Desktop

```json
{
  "mcpServers": {
    "solana-dev": {
      "command": "npx",
      "args": ["solana-mcp-test"]
    }
  }
}
```

## Tool Usage

### Solana Development Tool

The `solana_development_tool` provides a way to search for and retrieve relevant resources for Solana development.

#### Parameters:

- `query` (string): Search query to find relevant Solana resources or code question
- `code` (string, optional): Code snippet to analyze or debug, will be preserved with proper formatting
- `context` (string, optional): Additional context or conversation history to consider when finding resources

#### Examples:

Basic query:

```
solana_development_tool --query="How do I create a Solana NFT?"
```

With code:

```
solana_development_tool --query="Why am I getting this error?" --code="use anchor_lang::prelude::*;

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
solana_development_tool --query="Debugging help" --context="I'm building a Solana program that handles tokens. I'm getting the error 'Attempt to debit an account but found no record of a prior credit' when I try to transfer tokens in my test."
```

## How It Works

This tool uses a Cloudflare Worker to proxy requests to the Inkeep API:

1. Your query, code snippets, and additional context are sent to a Cloudflare Worker (https://cloudflare-inkeep.zyjliu.workers.dev/api/inkeep)
2. The Worker retrieves relevant responses and Solana-specific resources targeting your specific issue
