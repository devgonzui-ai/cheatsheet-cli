import { DataStore, Sheet } from '../types';
export declare const initStorage: () => Promise<void>;
export declare const loadData: () => Promise<DataStore>;
export declare const saveData: (data: DataStore) => Promise<void>;
export declare const getSheet: (name: string) => Promise<Sheet | undefined>;
export declare const addOrUpdateSheet: (sheet: Sheet) => Promise<void>;
export declare const removeSheet: (name: string) => Promise<boolean>;
export declare const getSheetFilePath: (sheet: Sheet) => string;
export declare const getAllSheets: () => Promise<Sheet[]>;
export declare const validateName: (name: string) => boolean;
export declare const isValidImageExtension: (filename: string) => boolean;
export declare const readSheetContent: (sheet: Sheet) => Promise<string>;
export declare const writeSheetContent: (sheet: Sheet, content: string) => Promise<void>;
export declare const copyFile: (src: string, dest: string) => Promise<void>;
export declare const renameSheet: (oldName: string, newName: string) => Promise<boolean>;
//# sourceMappingURL=storage.d.ts.map