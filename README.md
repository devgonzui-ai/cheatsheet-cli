# cheatsheet-cli (cs)

[![npm version](https://img.shields.io/npm/v/@gonzui/csheet-cli.svg)](https://www.npmjs.com/package/@gonzui/csheet-cli)
[![npm downloads](https://img.shields.io/npm/dm/@gonzui/csheet-cli.svg)](https://www.npmjs.com/package/@gonzui/csheet-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A CLI tool for managing command and tool cheatsheets locally.

[日本語版 README](./README.ja.md)

## Installation

```bash
npm install -g @gonzui/csheet-cli
```

## Commands

| Command | Description |
|---------|-------------|
| `cs add <name>` | Add a cheatsheet (opens $EDITOR, defaults to vim) |
| `cs add <name> --file <path>` | Add from an existing file |
| `cs add <name> --stdin` | Add from stdin (e.g. `tldr tar \| cs add tar-tips --stdin`) |
| `cs add <name> --tag <tags>` | Add with comma-separated tags |
| `cs list` | List all cheatsheets |
| `cs list --tag <tag>` | List cheatsheets filtered by tag |
| `cs show <name>` | Display cheatsheet content (with Markdown rendering) |
| `cs show <name> --raw` | Display raw Markdown |
| `cs copy <name>` | Copy a code block to the clipboard (interactive if multiple) |
| `cs copy <name> <index>` | Copy the Nth code block to the clipboard |
| `cs copy <name> --all` | Copy the entire sheet content to the clipboard |
| `cs search <keyword>` | Search by filename and content |
| `cs search --tag <tag>` | Search by tag (combinable with a keyword) |
| `cs edit <name>` | Edit a cheatsheet |
| `cs rm <name>` | Delete a cheatsheet (with confirmation) |
| `cs rm <name> --force` | Delete without confirmation |
| `cs rename <old> <new>` | Rename a cheatsheet |
| `cs rename <old> <new> -f` | Rename and overwrite if new name exists |
| `cs export <name>` | Export to current directory |
| `cs export <name> --out <path>` | Export to specified path |
| `cs mcp` | Start an MCP server for AI agents (Claude Code, Claude Desktop, etc.) |

## Usage Examples

### Add a new cheatsheet

```bash
# Open editor to create new cheatsheet
cs add git-commands

# Add from existing file
cs add docker-tips --file ~/notes/docker.md

# Add from stdin without opening an editor
tldr tar | cs add tar-tips --stdin

# Add with tags
cs add git-commands --tag git,vcs
```

### View cheatsheets

```bash
# List all cheatsheets
cs list

# List only cheatsheets with a tag
cs list --tag git

# Show with Markdown rendering
cs show git-commands

# Show raw Markdown
cs show git-commands --raw
```

### Copy to clipboard

```bash
# Copy a code block (prompts for selection if there are multiple)
cs copy git-commands

# Copy the 2nd code block directly
cs copy git-commands 2

# Copy the entire sheet
cs copy git-commands --all
```

### Search

```bash
# Search by name or content
cs search commit

# Search by tag
cs search --tag git

# Combine keyword and tag
cs search commit --tag git
```

### Edit and delete

```bash
# Edit in $EDITOR
cs edit git-commands

# Delete with confirmation
cs rm old-cheatsheet

# Delete without confirmation
cs rm old-cheatsheet --force
```

### Export

```bash
# Export to current directory
cs export git-commands

# Export to specific path
cs export git-commands --out ~/backup/
```

### MCP Server (AI integration)

`cs mcp` starts an [MCP](https://modelcontextprotocol.io/) server over stdio, turning your local cheatsheets into a knowledge base for AI agents. No API key needed — the connecting AI agent does the work.

```bash
# Register with Claude Code
claude mcp add cheatsheet -- cs mcp
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "cheatsheet": { "command": "cs", "args": ["mcp"] }
  }
}
```

Once connected, the agent can:

| MCP Tool | Description |
|----------|-------------|
| `search_cheatsheets` | Search your sheets by keyword and/or tag |
| `get_cheatsheet` | Read the full Markdown content of a sheet |
| `list_cheatsheets` | List all sheets with tags |
| `add_cheatsheet` | Save new knowledge as a cheatsheet (with tags) |

So you can ask Claude things like *"check my cheatsheets for the deploy procedure"* or *"save this jq one-liner collection as a cheatsheet"*.

## Features

- **MCP Server**: Expose your cheatsheets to AI agents with `cs mcp`
- **Markdown Rendering**: Syntax highlighting for code blocks, formatted tables, colored headings
- **Full-text Search**: Search by cheatsheet name and content
- **Tags**: Organize and filter cheatsheets with tags
- **Clipboard Copy**: Copy code blocks straight to the clipboard with `cs copy`
- **Pipe-friendly**: Register sheets from stdin with `cs add --stdin`
- **Editor Integration**: Uses `$EDITOR` environment variable (defaults to vim)

## Samples

Sample cheatsheets are available in the `sample/` directory:

```
sample/
├── en/           # English
│   ├── cc-skills.md    # Claude Code skills
│   ├── cs-help.md      # This CLI help
│   ├── tmux.md         # tmux commands
│   └── vim.md          # Vim commands
└── ja/           # Japanese
    ├── cc-skills.md
    ├── cs-help.md
    ├── tmux.md
    └── vim.md
```

### Add samples to your cheatsheets

```bash
# Add English samples
cs add vim --file sample/en/vim.md
cs add tmux --file sample/en/tmux.md
cs add cc-skills --file sample/en/cc-skills.md
cs add cs-help --file sample/en/cs-help.md

# Add Japanese samples
cs add vim --file sample/ja/vim.md
cs add tmux --file sample/ja/tmux.md
cs add cc-skills --file sample/ja/cc-skills.md
cs add cs-help --file sample/ja/cs-help.md
```

## Data Storage

Cheatsheets are stored in `~/.config/cheatsheet-cli/`:

```
~/.config/cheatsheet-cli/
├── data.json      # Metadata
└── sheets/        # Markdown files
    └── {name}.md
```

## Naming Rules

Cheatsheet names can only contain:
- Alphanumeric characters (a-z, A-Z, 0-9)
- Hyphens (-)
- Underscores (_)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run test:watch
```

## License

MIT
