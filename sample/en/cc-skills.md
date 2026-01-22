# Claude Code Skills Cheatsheet

## Built-in Commands

### General Operations

| Command | Description |
|---------|-------------|
| /help | Display help |
| /exit | End session |
| /clear | Clear conversation history |
| /context | Visualize context usage |
| /compact [instructions] | Compact conversation |

### Settings & Configuration

| Command | Description |
|---------|-------------|
| /config | Open settings interface |
| /status | Show version, model, account info |
| /model | Select/change AI model |
| /theme | Change color theme |
| /permissions | View/update permission settings |
| /plan | Enter Plan Mode directly |

### Project & Memory Management

| Command | Description |
|---------|-------------|
| /init | Initialize project with CLAUDE.md |
| /memory | Edit CLAUDE.md memory file |

### Session Management

| Command | Description |
|---------|-------------|
| /rename <name> | Name current session |
| /resume [session] | Resume session |
| /rewind | Rewind conversation or code changes |
| /export [filename] | Export conversation |

### Tracking & Analytics

| Command | Description |
|---------|-------------|
| /cost | Show token usage statistics |
| /stats | Show daily usage, session history |
| /usage | Show plan usage limits |

### Tools & Connection Management

| Command | Description |
|---------|-------------|
| /mcp | Manage MCP connections and OAuth |
| /tasks | List background tasks |
| /todos | Show current TODO items |
| /doctor | Check installation health |

## Keyboard Shortcuts

### General Operations

| Shortcut | Function |
|----------|----------|
| Ctrl+C | Cancel current input/generation |
| Ctrl+D | End session |
| Ctrl+L | Clear terminal screen |
| Ctrl+O | Toggle verbose output |
| Ctrl+R | Reverse search command history |
| Ctrl+G | Open in text editor |
| Ctrl+V | Paste image from clipboard |
| Ctrl+B | Run in background |
| Esc + Esc | Rewind conversation/code changes |
| Shift+Tab | Toggle permission mode |
| Alt+P | Switch model |
| Alt+T | Toggle extended thinking |

### Multiline Mode

| Method | Shortcut |
|--------|----------|
| Quick Escape | \ + Enter |
| macOS | Option+Enter |
| Terminal | Shift+Enter |
| Control Sequence | Ctrl+J |

### Quick Commands

| Input | Action |
|-------|--------|
| / | Skill or command |
| ! | Bash mode |
| @ | File path completion |

## Custom Skills

### Skill Storage Locations

| Location | Path | Scope |
|----------|------|-------|
| Personal | ~/.claude/skills/<skill-name>/SKILL.md | All projects |
| Project | .claude/skills/<skill-name>/SKILL.md | Current project |

### SKILL.md Format

| Field | Description |
|-------|-------------|
| name | Skill name (lowercase, hyphens, numbers only) |
| description | Skill description |
| disable-model-invocation: true | Disable auto-execution |
| user-invocable: false | Disable user invocation |
| allowed-tools | Restrict available tools |
| context: fork | Run in isolated environment |
| argument-hint | Argument hint |

### Skill Creation Example

```bash
# Create skill directory
mkdir -p ~/.claude/skills/my-skill

# Create SKILL.md
cat > ~/.claude/skills/my-skill/SKILL.md << 'SKILL'
---
name: my-skill
description: Skill description
---
Skill content...
SKILL
```

### Invoking Skills

```
/my-skill [arguments]
```
