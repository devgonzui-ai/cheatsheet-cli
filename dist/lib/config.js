"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditor = exports.IMAGES_DIR = exports.SHEETS_DIR = exports.DATA_FILE = exports.CONFIG_DIR = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
// 設定ディレクトリのパス
exports.CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.config', 'cheatsheet-cli');
// 各ファイル・ディレクトリのパス
exports.DATA_FILE = path_1.default.join(exports.CONFIG_DIR, 'data.json');
exports.SHEETS_DIR = path_1.default.join(exports.CONFIG_DIR, 'sheets');
exports.IMAGES_DIR = path_1.default.join(exports.CONFIG_DIR, 'images');
// デフォルトのエディタ
const getEditor = () => {
    return process.env.EDITOR || 'vim';
};
exports.getEditor = getEditor;
//# sourceMappingURL=config.js.map