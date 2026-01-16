export type SheetType = 'text' | 'image';
export interface Sheet {
    name: string;
    type: SheetType;
    filename: string;
    createdAt: string;
    updatedAt: string;
}
export interface DataStore {
    sheets: Sheet[];
}
export declare const SUPPORTED_IMAGE_EXTENSIONS: readonly ["png", "jpg", "jpeg", "gif", "webp", "svg"];
export declare const NAME_PATTERN: RegExp;
//# sourceMappingURL=types.d.ts.map