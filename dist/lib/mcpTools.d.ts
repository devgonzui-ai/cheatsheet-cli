export interface ToolResult {
    text: string;
    isError?: boolean;
}
export declare const listCheatsheets: (tag?: string) => Promise<ToolResult>;
export declare const searchCheatsheets: (keyword?: string, tag?: string) => Promise<ToolResult>;
export declare const getCheatsheet: (name: string) => Promise<ToolResult>;
export declare const addCheatsheet: (input: {
    name: string;
    content: string;
    tags?: string;
    overwrite?: boolean;
}) => Promise<ToolResult>;
//# sourceMappingURL=mcpTools.d.ts.map