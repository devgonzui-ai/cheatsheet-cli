export declare const DEFAULT_TIMEOUT_MS = 10000;
export declare const validateTopic: (topic: string) => boolean;
export declare const topicToSheetName: (topic: string) => string;
export declare const buildUrl: (topic: string) => string;
export declare const stripAnsi: (text: string) => string;
export declare const isUnknownTopic: (body: string) => boolean;
export declare const toMarkdown: (topic: string, content: string, date?: Date) => string;
export interface FetchOptions {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
}
export declare const fetchCheatSheet: (topic: string, options?: FetchOptions) => Promise<string>;
//# sourceMappingURL=cheatsh.d.ts.map