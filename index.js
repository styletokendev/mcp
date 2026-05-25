#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_HOME = process.env.CLAUDE_CONFIG_HOME || path.join(process.env.HOME || '~', '.config', 'claude');
const CONFIG_PATH = path.join(CONFIG_HOME, 'mcp.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('');
  console.log('  Styletoken Connect');
  console.log('  ──────────────────');
  console.log('  This will connect Claude Code to your Styletoken project.');
  console.log('');

  // Get token
  const token = await prompt('  Paste your API token from styletoken.dev/account: ');
  const trimmed = token.trim();

  if (!trimmed || !trimmed.startsWith('hk_')) {
    console.log('');
    console.log('  Invalid token. Tokens start with hk_.');
    console.log('  Get one at https://styletoken.dev/account');
    process.exit(1);
  }

  // Create config dir if needed
  fs.mkdirSync(CONFIG_HOME, { recursive: true });

  // Read existing config or start fresh
  let config = {};
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch {
      console.log('  Warning: existing config file is invalid. Overwriting.');
    }
  }

  // Set MCP server entry
  if (!config.mcpServers) config.mcpServers = {};
  config.mcpServers.styletoken = {
    command: 'npx',
    args: ['@styletoken/mcp-server'],
    env: {
      STYLETOKEN_API_KEY: trimmed
    }
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  console.log('');
  console.log(`  Done. Config written to ${CONFIG_PATH}`);
  console.log('');
  console.log('  Claude Code will now have access to your project.');
  console.log('  Restart Claude Code if it is already running.');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
