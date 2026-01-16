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
//# sourceMappingURL=search.d.ts.map