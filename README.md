# OpenRouter MCP Client for Cursor

A Model Context Protocol (MCP) client for Cursor that utilizes OpenRouter.ai to access multiple AI models.

## Requirements

- **Node.js v18.0.0 or later** (important!)
- OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))

## Features

- Connect to OpenRouter.ai via MCP
- Access multiple AI models from various providers (Google, DeepSeek, Meta, etc.)
- Use MCP transport mechanism to communicate with Cursor
- Cache model information to reduce API calls
- Support for both free and paid models
- Multi-model completion utility to combine results from multiple models

## Available Models

This client provides access to all models available on OpenRouter, including:

- Google Gemini 2.5 Pro
- DeepSeek Chat v3
- Meta Llama 3.1
- DeepSeek R1
- Qwen Coder
- Mistral Small 3.1
- And many more!

## Quick Installation

The easiest way to install is to use the setup script:

```bash
# Clone the repository
git clone https://your-repo-url/openrouter-mcp-client.git
cd openrouter-mcp-client

# Run the installation script
node install.cjs
```

The script will:
1. Help you create a `.env` file with your OpenRouter API key
2. Install all dependencies
3. Build the project
4. Provide next steps

## Manual Installation

If you prefer to install manually:

```bash
# Clone the repository
git clone https://your-repo-url/openrouter-mcp-client.git
cd openrouter-mcp-client

# Install dependencies
npm install

# Copy environment file and edit it with your API key
cp .env.example .env
# Edit .env file with your OpenRouter API key

# Build the project
npm run build
```

## Configuration

Edit the `.env` file with your OpenRouter API key and default model:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-pro-exp-03-25:free
```

Get your API key from [OpenRouter Keys](https://openrouter.ai/keys).

## Cursor Integration

To use this client with Cursor, you need to update Cursor's MCP configuration file:

1. Find Cursor's configuration directory:
   - Windows: `%USERPROFILE%\.cursor\`
   - macOS: `~/.cursor/`
   - Linux: `~/.cursor/`

2. Edit or create the `mcp.json` file in that directory. Add a configuration like this:

```json
{
  "mcpServers": {
    "custom-openrouter-client": {
      "command": "node",
      "args": [
        "FULL_PATH_TO/openrouter-mcp-client/dist/index.js"
      ],
      "env": {
        "OPENROUTER_API_KEY": "your_api_key_here",
        "OPENROUTER_DEFAULT_MODEL": "google/gemini-2.5-pro-exp-03-25:free"
      }
    }
  }
}
```

Replace `FULL_PATH_TO` with the actual path to your client installation.

3. Restart Cursor

4. Select the client by:
   - Opening Cursor
   - Press Ctrl+Shift+L (Windows/Linux) or Cmd+Shift+L (macOS) to open the model selector
   - Choose "custom-openrouter-client" from the list

## Direct Testing (without MCP)

Uncomment the test functions in `src/index.ts` to test direct API interaction:

```typescript
// Uncomment to test the direct API
testDirectApi().catch(console.error);
testMultiModelCompletion().catch(console.error);
```

Then run:

```bash
npm start
```

## Development

```bash
# Watch mode for development
npm run dev
```

## Troubleshooting

### Node.js Version Requirements

**Important:** This project requires Node.js v18.0.0 or later. If you're using an older version, you will see EBADENGINE warnings and may encounter errors. To check your Node.js version:

```bash
node --version
```

If you have an older version, download and install the latest LTS version from [nodejs.org](https://nodejs.org/).

### Module System Errors

If you encounter errors related to ES modules vs CommonJS:

- The main codebase uses ES modules (indicated by `"type": "module"` in package.json)
- The installation script uses CommonJS (with a .cjs extension)
- Make sure to run the installation script with `node install.cjs`

### Cursor Not Connecting

If Cursor doesn't seem to connect to your client:

1. Make sure the path in `mcp.json` is correct and uses forward slashes
2. Check that you've built the client with `npm run build`
3. Verify that your OpenRouter API key is correct in the env settings
4. Check Cursor logs for any errors

## Related Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.ai/)
- [Cursor Editor](https://cursor.sh/) 