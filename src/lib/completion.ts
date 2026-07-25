// シェル補完スクリプトの生成

// 補完対象のサブコマンド一覧
export const COMPLETION_COMMANDS = [
  'add',
  'fetch',
  'gen',
  'refine',
  'list',
  'show',
  'search',
  'copy',
  'mcp',
  'edit',
  'rm',
  'rename',
  'export',
  'backup',
  'restore',
  'config',
  'completion',
  'help',
] as const;

// シート名を引数に取るサブコマンド（cs _names で動的補完する）
export const SHEET_NAME_COMMANDS = [
  'show',
  'copy',
  'edit',
  'rm',
  'rename',
  'export',
  'refine',
] as const;

export const SUPPORTED_SHELLS = ['zsh', 'bash'] as const;
export type SupportedShell = (typeof SUPPORTED_SHELLS)[number];

const zshScript = (): string => `#compdef cs
# cheatsheet-cli completion for zsh
# Install: add \`eval "$(cs completion zsh)"\` to ~/.zshrc (after compinit)
_cs() {
  local -a _cs_commands
  _cs_commands=(${COMPLETION_COMMANDS.join(' ')})
  if (( CURRENT == 2 )); then
    _describe 'command' _cs_commands
    return
  fi
  case $words[2] in
    ${SHEET_NAME_COMMANDS.join('|')})
      local -a _cs_names
      _cs_names=(\${(f)"$(cs _names 2>/dev/null)"})
      _describe 'cheatsheet' _cs_names
      ;;
    completion)
      _describe 'shell' '(${SUPPORTED_SHELLS.join(' ')})'
      ;;
  esac
}
compdef _cs cs
`;

const bashScript = (): string => `# cheatsheet-cli completion for bash
# Install: add \`eval "$(cs completion bash)"\` to ~/.bashrc
_cs_completions() {
  local cur=\${COMP_WORDS[COMP_CWORD]}
  if [ "\$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=($(compgen -W "${COMPLETION_COMMANDS.join(' ')}" -- "\$cur"))
    return
  fi
  case \${COMP_WORDS[1]} in
    ${SHEET_NAME_COMMANDS.join('|')})
      COMPREPLY=($(compgen -W "$(cs _names 2>/dev/null)" -- "\$cur"))
      ;;
    completion)
      COMPREPLY=($(compgen -W "${SUPPORTED_SHELLS.join(' ')}" -- "\$cur"))
      ;;
  esac
}
complete -F _cs_completions cs
`;

// シェルに対応する補完スクリプトを返す（未対応シェルは undefined）
export const getCompletionScript = (shell: string): string | undefined => {
  switch (shell) {
    case 'zsh':
      return zshScript();
    case 'bash':
      return bashScript();
    default:
      return undefined;
  }
};
