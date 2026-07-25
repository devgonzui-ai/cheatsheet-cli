"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditor = exports.IMAGES_DIR = exports.SHEETS_DIR = exports.DATA_FILE = exports.CONFIG_DIR = exports.saveConfig = exports.loadConfig = exports.expandHome = exports.CONFIG_KEYS = exports.SETTINGS_FILE = exports.SETTINGS_DIR = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
// 設定ファイル（config.json）は常にここに置く（データ保存先とは独立）
exports.SETTINGS_DIR = path_1.default.join(os_1.default.homedir(), '.config', 'cheatsheet-cli');
exports.SETTINGS_FILE = path_1.default.join(exports.SETTINGS_DIR, 'config.json');
exports.CONFIG_KEYS = ['editor', 'dir'];
// ~ をホームディレクトリに展開
const expandHome = (target) => {
    if (target === '~') {
        return os_1.default.homedir();
    }
    if (target.startsWith('~/')) {
        return path_1.default.join(os_1.default.homedir(), target.slice(2));
    }
    return target;
};
exports.expandHome = expandHome;
// 設定ファイルを読み込む（壊れている・存在しない場合は空設定）
const loadConfig = (file = exports.SETTINGS_FILE) => {
    try {
        const parsed = JSON.parse(fs_1.default.readFileSync(file, 'utf-8'));
        if (typeof parsed !== 'object' || parsed === null) {
            return {};
        }
        const config = {};
        if (typeof parsed.editor === 'string') {
            config.editor = parsed.editor;
        }
        if (typeof parsed.dir === 'string') {
            config.dir = parsed.dir;
        }
        return config;
    }
    catch {
        return {};
    }
};
exports.loadConfig = loadConfig;
// 設定ファイルを保存する
const saveConfig = (config, file = exports.SETTINGS_FILE) => {
    fs_1.default.mkdirSync(path_1.default.dirname(file), { recursive: true });
    fs_1.default.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
};
exports.saveConfig = saveConfig;
// 起動時に一度だけ読み込む（cs config での変更は次回起動から反映）
const config = (0, exports.loadConfig)();
// データ保存先（config.json の dir で変更可能）
exports.CONFIG_DIR = config.dir ? path_1.default.resolve((0, exports.expandHome)(config.dir)) : exports.SETTINGS_DIR;
// 各ファイル・ディレクトリのパス
exports.DATA_FILE = path_1.default.join(exports.CONFIG_DIR, 'data.json');
exports.SHEETS_DIR = path_1.default.join(exports.CONFIG_DIR, 'sheets');
exports.IMAGES_DIR = path_1.default.join(exports.CONFIG_DIR, 'images');
// エディタ: config.json > $EDITOR > vim
const getEditor = () => {
    return config.editor || process.env.EDITOR || 'vim';
};
exports.getEditor = getEditor;
//# sourceMappingURL=config.js.map