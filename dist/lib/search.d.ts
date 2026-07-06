import { Sheet } from '../types';
export interface SearchResult {
    name: string;
    type: 'text' | 'image';
    matchType: 'name' | 'content';
}
export declare const matchByName: (sheet: Sheet, keyword: string) => boolean;
export declare const matchByContent: (content: string, keyword: string) => boolean;
export declare const createSearchResult: (sheet: Sheet, matchType: "name" | "content") => SearchResult;
export declare const searchSheetsByName: (sheets: Sheet[], keyword: string) => SearchResult[];
export declare const fuzzyMatch: (text: string, keyword: string) => boolean;
export interface MatchLine {
    lineNumber: number;
    line: string;
}
export declare const findMatchingLines: (content: string, keyword: string, limit?: number) => MatchLine[];
export declare const highlightKeyword: (line: string, keyword: string, colorize: (match: string) => string) => string;
//# sourceMappingURL=search.d.ts.map