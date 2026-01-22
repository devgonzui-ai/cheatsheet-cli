# tmux Cheatsheet

## Session Management

| Command | Description |
|---------|-------------|
| `tmux new -s name` | Create named session |
| `tmux ls` | List sessions |
| `tmux attach -t name` | Attach to session |
| `tmux kill-session -t name` | Kill session |
| `tmux rename-session -t old new` | Rename session |

## Prefix Key (Default: Ctrl+b)

| Key | Description |
|-----|-------------|
| `d` | Detach from session |
| `$` | Rename session |
| `s` | List sessions |
| `(` | Previous session |
| `)` | Next session |

## Window Operations

| Key | Description |
|-----|-------------|
| `c` | Create new window |
| `,` | Rename window |
| `&` | Kill window |
| `n` | Next window |
| `p` | Previous window |
| `0-9` | Switch to window by number |
| `w` | List windows |
| `f` | Find window |

## Pane Operations

| Key | Description |
|-----|-------------|
| `%` | Split horizontally |
| `"` | Split vertically |
| `o` | Move to next pane |
| `q` | Show pane numbers |
| `x` | Kill pane |
| `z` | Toggle pane zoom |
| `{` | Move pane left |
| `}` | Move pane right |
| `Space` | Toggle layout |
| Arrow keys | Move between panes |

## Pane Resizing (Prefix + hold)

| Key | Description |
|-----|-------------|
| `Ctrl + Arrow` | Resize by 1 cell |
| `Alt + Arrow` | Resize by 5 cells |

## Copy Mode (Prefix + [)

| Key | Description |
|-----|-------------|
| `Space` | Start selection |
| `Enter` | Copy |
| `q` | Exit copy mode |
| `/` | Search forward |
| `?` | Search backward |
| `n` | Next search result |
| `N` | Previous search result |

## Others

| Key | Description |
|-----|-------------|
| `?` | List key bindings |
| `:` | Command prompt |
| `t` | Show clock |
| `i` | Show window info |
