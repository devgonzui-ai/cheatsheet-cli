# cheatsheet-cli (cs)

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
| `cs list` | List all cheatsheets |
| `cs show <name>` | Display cheatsheet content (with Markdown rendering) |
| `cs show <name> --raw` | Display raw Markdown |
| `cs search <keyword>` | Search by filename and content |
| `cs edit <name>` | Edit a cheatsheet |
| `cs rm <name>` | Delete a cheatsheet (with confirmation) |
| `cs rm <name> --force` | Delete without confirmation |
| `cs rename <old> <new>` | Rename a cheatsheet |
| `cs rename <old> <new> -f` | Rename and overwrite if new name exists |
| `cs export <name>` | Export to current directory |
| `cs export <name> --out <path>` | Export to specified path |

## Usage Examples

### Add a new cheatsheet

```bash
# Open editor to create new cheatsheet
cs add git-commands

# Add from existing file
cs add docker-tips --file ~/notes/docker.md
```

### View cheatsheets

```bash
# List all cheatsheets
cs list

# Show with Markdown rendering
cs show git-commands

# Show raw Markdown
cs show git-commands --raw
```

### Search

```bash
# Search by name or content
cs search commit
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

## Features

- **Markdown Rendering**: Syntax highlighting for code blocks, formatted tables, colored headings
- **Full-text Search**: Search by cheatsheet name and content
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
