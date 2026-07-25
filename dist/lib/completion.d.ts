export declare const COMPLETION_COMMANDS: readonly ["add", "gen", "refine", "list", "show", "search", "copy", "mcp", "edit", "rm", "rename", "export", "backup", "restore", "config", "completion", "help"];
export declare const SHEET_NAME_COMMANDS: readonly ["show", "copy", "edit", "rm", "rename", "export", "refine"];
export declare const SUPPORTED_SHELLS: readonly ["zsh", "bash"];
export type SupportedShell = (typeof SUPPORTED_SHELLS)[number];
export declare const getCompletionScript: (shell: string) => string | undefined;
//# sourceMappingURL=completion.d.ts.map