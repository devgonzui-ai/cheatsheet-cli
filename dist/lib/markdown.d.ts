export declare const getDisplayWidth: (str: string) => number;
export declare const formatCodeBlock: (code: string, lang: string) => string;
export declare const processInline: (text: string) => string;
export declare const formatTable: (tableLines: string[]) => string;
export interface CodeBlock {
    lang: string;
    code: string;
}
export declare const extractCodeBlocks: (content: string) => CodeBlock[];
export declare const renderMarkdown: (content: string) => string;
//# sourceMappingURL=markdown.d.ts.map