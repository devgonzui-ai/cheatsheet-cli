# Vim Cheatsheet

## Mode Switching

| Key | Description |
|-----|-------------|
| `i` | Insert mode at cursor |
| `I` | Insert mode at line start |
| `a` | Insert mode after cursor |
| `A` | Insert mode at line end |
| `o` | Insert line below and enter insert mode |
| `O` | Insert line above and enter insert mode |
| `v` | Visual mode |
| `V` | Line visual mode |
| `Ctrl+v` | Block visual mode |
| `Esc` | Return to normal mode |

## Cursor Movement

| Key | Description |
|-----|-------------|
| `h/j/k/l` | Left/Down/Up/Right |
| `w` | Next word start |
| `b` | Previous word start |
| `e` | Word end |
| `0` | Line start |
| `^` | Line start (non-blank) |
| `$` | Line end |
| `gg` | File start |
| `G` | File end |
| `:{number}` | Jump to line |
| `%` | Matching bracket |
| `f{char}` | Find char forward in line |
| `F{char}` | Find char backward in line |

## Editing

| Key | Description |
|-----|-------------|
| `x` | Delete character |
| `dd` | Delete line |
| `dw` | Delete word |
| `d$` | Delete to line end |
| `D` | Same as d$ |
| `cc` | Change line |
| `cw` | Change word |
| `C` | Change to line end |
| `yy` | Yank (copy) line |
| `yw` | Yank word |
| `p` | Paste after cursor |
| `P` | Paste before cursor |
| `u` | Undo |
| `Ctrl+r` | Redo |
| `.` | Repeat last operation |
| `r{char}` | Replace character |
| `R` | Replace mode |
| `J` | Join lines |
| `~` | Toggle case |
| `>>` | Indent |
| `<<` | Unindent |

## Search & Replace

| Key | Description |
|-----|-------------|
| `/{pattern}` | Search forward |
| `?{pattern}` | Search backward |
| `n` | Next search result |
| `N` | Previous search result |
| `*` | Search word under cursor forward |
| `#` | Search word under cursor backward |
| `:s/old/new/` | Replace first in line |
| `:s/old/new/g` | Replace all in line |
| `:%s/old/new/g` | Replace all in file |
| `:%s/old/new/gc` | Replace with confirmation |

## File Operations

| Command | Description |
|---------|-------------|
| `:w` | Save |
| `:w {filename}` | Save as |
| `:q` | Quit |
| `:q!` | Quit without saving |
| `:wq` / `:x` / `ZZ` | Save and quit |
| `:e {file}` | Open file |
| `:r {file}` | Insert file contents |
| `:!{command}` | Execute external command |

## Window Splitting

| Key | Description |
|-----|-------------|
| `:sp` | Split horizontal |
| `:vs` | Split vertical |
| `Ctrl+w h/j/k/l` | Move to window |
| `Ctrl+w w` | Next window |
| `Ctrl+w q` | Close window |
| `Ctrl+w =` | Equalize window sizes |
| `Ctrl+w +/-` | Increase/decrease height |
| `Ctrl+w >/<` | Increase/decrease width |

## Tabs

| Command | Description |
|---------|-------------|
| `:tabnew` | New tab |
| `:tabn` / `gt` | Next tab |
| `:tabp` / `gT` | Previous tab |
| `:tabc` | Close tab |

## Macros

| Key | Description |
|-----|-------------|
| `q{register}` | Start recording macro |
| `q` | Stop recording |
| `@{register}` | Execute macro |
| `@@` | Repeat last macro |

## Others

| Key | Description |
|-----|-------------|
| `:set nu` | Show line numbers |
| `:set nonu` | Hide line numbers |
| `:noh` | Clear search highlight |
| `Ctrl+g` | Show file info |
| `za` | Toggle fold |
