"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpCommand = void 0;
const commander_1 = require("commander");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const mcpTools_1 = require("../lib/mcpTools");
// ToolResult を MCP の CallToolResult に変換
const toCallToolResult = (result) => ({
    content: [{ type: 'text', text: result.text }],
    isError: result.isError,
});
exports.mcpCommand = new commander_1.Command('mcp')
    .description('Start an MCP server exposing cheatsheets to AI agents (stdio transport)')
    .action(async () => {
    const server = new mcp_js_1.McpServer({
        name: 'cheatsheet-cli',
        version: '1.2.0',
    });
    server.registerTool('list_cheatsheets', {
        title: 'List cheatsheets',
        description: "List all cheatsheets in the user's local collection with their tags, most recently updated first. Optionally filter by tag.",
        inputSchema: {
            tag: zod_1.z.string().optional().describe('Only list cheatsheets with this tag'),
        },
    }, async ({ tag }) => toCallToolResult(await (0, mcpTools_1.listCheatsheets)(tag)));
    server.registerTool('search_cheatsheets', {
        title: 'Search cheatsheets',
        description: "Search the user's local cheatsheets by keyword (matches sheet names and content) and/or tag. Call this when the user asks about commands, tools, or procedures they may have noted before.",
        inputSchema: {
            keyword: zod_1.z.string().optional().describe('Keyword to match against names and content'),
            tag: zod_1.z.string().optional().describe('Only search cheatsheets with this tag'),
        },
    }, async ({ keyword, tag }) => toCallToolResult(await (0, mcpTools_1.searchCheatsheets)(keyword, tag)));
    server.registerTool('get_cheatsheet', {
        title: 'Get a cheatsheet',
        description: 'Get the full Markdown content of a cheatsheet by name. Use search_cheatsheets or list_cheatsheets first if the exact name is unknown.',
        inputSchema: {
            name: zod_1.z.string().describe('Exact name of the cheatsheet'),
        },
    }, async ({ name }) => toCallToolResult(await (0, mcpTools_1.getCheatsheet)(name)));
    server.registerTool('add_cheatsheet', {
        title: 'Add a cheatsheet',
        description: "Save a new Markdown cheatsheet to the user's local collection. Call this when the user asks to save commands, tips, or procedures as a cheatsheet. Fails if the name already exists unless overwrite is true.",
        inputSchema: {
            name: zod_1.z
                .string()
                .describe('Name of the cheatsheet (alphanumeric, hyphens, underscores only)'),
            content: zod_1.z.string().describe('Markdown content of the cheatsheet'),
            tags: zod_1.z.string().optional().describe('Comma-separated tags (e.g. "git,vcs")'),
            overwrite: zod_1.z.boolean().optional().describe('Replace an existing cheatsheet of the same name'),
        },
    }, async (input) => toCallToolResult(await (0, mcpTools_1.addCheatsheet)(input)));
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // stdio transport が閉じられるまでプロセスは待機し続ける
});
//# sourceMappingURL=mcp.js.map