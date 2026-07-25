---
name: cheatsheet-cli
description: Manage the user's local cheatsheets with the `cs` CLI. Use when the user asks to look up, save, generate, or organize command/tool cheatsheets (e.g. "check my cheatsheets", "save this as a cheatsheet", "何かチートシートにあった？").
---

# cheatsheet-cli (`cs`)

`cs` stores Markdown cheatsheets in `~/.config/cheatsheet-cli/`. Prefer the MCP server (`claude mcp add cheatsheet -- cs mcp`) when available; this skill covers direct CLI usage.

## Look things up

```bash
cs list                     # all sheets (with tags)
cs list --tag git           # filter by tag
cs search <keyword>         # name + content search, shows matching lines
cs search --tag git commit  # combine tag and keyword
cs show <name> --raw        # print raw Markdown (best for reading programmatically)
```

Sheet names for other commands: `cs _names` prints one name per line.

## Save knowledge

```bash
# Pipe content in (never opens an editor — always use --stdin when scripting)
echo "# jq\n..." | cs add jq-tips --stdin --tag json
some-command --help | cs add some-command --stdin

# Overwrite an existing sheet
... | cs add jq-tips --stdin --force
```

Names may only contain alphanumerics, hyphens, and underscores. Tags are comma-separated.

## AI helpers (require ANTHROPIC_API_KEY)

```bash
cs gen <name> <topic...>    # generate a new cheatsheet about a topic
cs refine <name>            # restructure a messy sheet into clean Markdown
cs refine <name> --dry-run  # preview without saving
```

## Maintain

```bash
cs edit <name>              # opens $EDITOR — avoid in non-interactive contexts
cs rm <name> --force        # delete without prompt
cs rename <old> <new>
cs export <name> --out <dir>
cs backup --out <path>      # tar.gz of all sheets
cs restore <file> --force   # restore from backup
```

## Notes for agents

- Use `--stdin`, `--force`, and `--raw` variants to stay non-interactive.
- `cs copy` (clipboard) and `cs` with no arguments (interactive picker) need a TTY — avoid them.
- Exit code 1 + `Error: ...` on stderr signals failure (e.g. sheet not found).
