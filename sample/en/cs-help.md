# csheet-cli (cs) Commands

## Installation

```bash
npm install -g @gonzui/csheet-cli
```

## Basic Commands

| Command | Description |
|---------|-------------|
| `cs add <name>` | Add a cheatsheet |
| `cs list` | List all cheatsheets |
| `cs show <name>` | Display contents |
| `cs search <keyword>` | Search by keyword |
| `cs edit <name>` | Edit cheatsheet |
| `cs rm <name>` | Remove cheatsheet |
| `cs rename <old> <new>` | Rename cheatsheet |
| `cs export <name>` | Export cheatsheet |

## Add

```bash
# Create new in editor
cs add git-commands

# Add from existing file
cs add docker-tips --file ~/notes/docker.md
```

## Show

```bash
# With Markdown rendering
cs show git-commands

# Raw Markdown
cs show git-commands --raw
```

## Remove

```bash
# With confirmation
cs rm old-sheet

# Without confirmation
cs rm old-sheet --force
```

## Export

```bash
# Output to current directory
cs export git-commands

# Output to specified path
cs export git-commands --out ~/backup/
```

## Data Storage Location

```
~/.config/cheatsheet-cli/
├── data.json      # Metadata
└── sheets/        # Markdown files
```
