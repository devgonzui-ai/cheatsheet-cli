export declare const SETTINGS_DIR: string;
export declare const SETTINGS_FILE: string;
export interface CliConfig {
    editor?: string;
    dir?: string;
}
export declare const CONFIG_KEYS: readonly ["editor", "dir"];
export type ConfigKey = (typeof CONFIG_KEYS)[number];
export declare const expandHome: (target: string) => string;
export declare const loadConfig: (file?: string) => CliConfig;
export declare const saveConfig: (config: CliConfig, file?: string) => void;
export declare const CONFIG_DIR: string;
export declare const DATA_FILE: string;
export declare const SHEETS_DIR: string;
export declare const IMAGES_DIR: string;
export declare const getEditor: () => string;
//# sourceMappingURL=config.d.ts.map