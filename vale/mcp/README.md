# Vale MCP

An MCP server providing Vale linting capabilities through the Model Context Protocol.

## Installation

1. Ensure you have [Vale](https://vale.sh/) installed on your system.
2. Clone this repository and build the project:

```bash
npm install
npm run build
```

## Tool Usage

### Vale Linting

The `vale-lint` tool provides a way to lint text or files using Vale:

#### Parameters:

- `target` (string): Text content or file path to lint
- `isFilePath` (boolean): Whether the target is a file path (default: false)
- `options` (string, optional): Additional Vale command options

#### Examples:

To lint a file:

```
vale-lint --target="path/to/file.md" --isFilePath=true
```

To lint text directly:

```
vale-lint --target="This is some text that will be checked by Vale."
```

With additional options:

```
vale-lint --target="path/to/file.md" --isFilePath=true --options="--minAlertLevel=error"
```

## How It Works

This tool is a thin wrapper around the Vale CLI. It works by:

1. Taking your input (either text content or a file path)
2. Executing the Vale CLI command with appropriate arguments
3. Capturing and returning the results

The tool handles Vale's non-zero exit codes (which occur when it finds issues) and properly returns the linting results.
