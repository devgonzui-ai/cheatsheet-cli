export declare const defaultBackupFilename: (date?: Date) => string;
export declare const resolveBackupPath: (out: string | undefined, cwd: string, date?: Date) => string;
export declare const createBackup: (file: string, fromDir?: string) => Promise<string[]>;
export declare const restoreBackup: (file: string, toDir?: string) => Promise<void>;
export declare const hasExistingData: (dir?: string) => Promise<boolean>;
export declare const countSheets: (dir?: string) => Promise<number>;
//# sourceMappingURL=backup.d.ts.map