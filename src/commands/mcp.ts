import { Command } from 'commander';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  ToolResult,
  listCheatsheets,
  searchCheatsheets,
  getCheatsheet,
  addCheatsheet,
} from '../lib/mcpTools';

// ToolResult を MCP の CallToolResult に変換
const toCallToolResult = (result: ToolResult) => ({
  content: [{ type: 'text' as const, text: result.text }],
  isError: result.isError,
});

export const mcpCommand = new Command('mcp')
  .description('Start an MCP server exposing cheatsheets to AI agents (stdio transport)')
  .action(async () => {
    const server = new McpServer({
      name: 'cheatsheet-cli',
      version: '1.2.0',
    });

    server.registerTool(
      'list_cheatsheets',
      {
        title: 'List cheatsheets',
        description:
          "List all cheatsheets in the user's local collection with their tags, most recently updated first. Optionally filter by tag.",
        inputSchema: {
          tag: z.string().optional().describe('Only list cheatsheets with this tag'),
        },
      },
      async ({ tag }) => toCallToolResult(await listCheatsheets(tag))
    );

    server.registerTool(
      'search_cheatsheets',
      {
        title: 'Search cheatsheets',
        description:
          "Search the user's local cheatsheets by keyword (matches sheet names and content) and/or tag. Call this when the user asks about commands, tools, or procedures they may have noted before.",
        inputSchema: {
          keyword: z.string().optional().describe('Keyword to match against names and content'),
          tag: z.string().optional().describe('Only search cheatsheets with this tag'),
        },
      },
      async ({ keyword, tag }) => toCallToolResult(await searchCheatsheets(keyword, tag))
    );

    server.registerTool(
      'get_cheatsheet',
      {
        title: 'Get a cheatsheet',
        description:
          'Get the full Markdown content of a cheatsheet by name. Use search_cheatsheets or list_cheatsheets first if the exact name is unknown.',
        inputSchema: {
          name: z.string().describe('Exact name of the cheatsheet'),
        },
      },
      async ({ name }) => toCallToolResult(await getCheatsheet(name))
    );

    server.registerTool(
      'add_cheatsheet',
      {
        title: 'Add a cheatsheet',
        description:
          "Save a new Markdown cheatsheet to the user's local collection. Call this when the user asks to save commands, tips, or procedures as a cheatsheet. Fails if the name already exists unless overwrite is true.",
        inputSchema: {
          name: z
            .string()
            .describe('Name of the cheatsheet (alphanumeric, hyphens, underscores only)'),
          content: z.string().describe('Markdown content of the cheatsheet'),
          tags: z.string().optional().describe('Comma-separated tags (e.g. "git,vcs")'),
          overwrite: z.boolean().optional().describe('Replace an existing cheatsheet of the same name'),
        },
      },
      async (input) => toCallToolResult(await addCheatsheet(input))
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);
    // stdio transport が閉じられるまでプロセスは待機し続ける
  });
