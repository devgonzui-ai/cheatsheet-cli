"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countSheets = exports.hasExistingData = exports.restoreBackup = exports.createBackup = exports.resolveBackupPath = exports.defaultBackupFilename = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tar = __importStar(require("tar"));
const config_1 = require("./config");
// バックアップ対象のエントリ（データディレクトリ直下）
const BACKUP_ENTRIES = ['data.json', 'sheets', 'images'];
// タイムスタンプ付きのデフォルトファイル名（例: cheatsheet-backup-20260706-153000.tar.gz）
const defaultBackupFilename = (date = new Date()) => {
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
        `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    return `cheatsheet-backup-${stamp}.tar.gz`;
};
exports.defaultBackupFilename = defaultBackupFilename;
// --out の解釈: 未指定→カレント、既存ディレクトリ→その中、それ以外→そのままファイルパス
const resolveBackupPath = (out, cwd, date) => {
    if (!out) {
        return path_1.default.join(cwd, (0, exports.defaultBackupFilename)(date));
    }
    const resolved = path_1.default.resolve(cwd, out);
    if (fs_extra_1.default.existsSync(resolved) && fs_extra_1.default.statSync(resolved).isDirectory()) {
        return path_1.default.join(resolved, (0, exports.defaultBackupFilename)(date));
    }
    return resolved;
};
exports.resolveBackupPath = resolveBackupPath;
// データディレクトリを tar.gz に固める。アーカイブしたエントリ名を返す
const createBackup = async (file, fromDir = config_1.CONFIG_DIR) => {
    const entries = BACKUP_ENTRIES.filter((entry) => fs_extra_1.default.existsSync(path_1.default.join(fromDir, entry)));
    if (entries.length === 0) {
        throw new Error(`Nothing to back up in ${fromDir}`);
    }
    await fs_extra_1.default.ensureDir(path_1.default.dirname(file));
    await tar.create({ gzip: true, file, cwd: fromDir }, entries);
    return entries;
};
exports.createBackup = createBackup;
// tar.gz をデータディレクトリに展開する（既存ファイルは上書き）
const restoreBackup = async (file, toDir = config_1.CONFIG_DIR) => {
    await fs_extra_1.default.ensureDir(toDir);
    await tar.extract({ file, cwd: toDir });
};
exports.restoreBackup = restoreBackup;
// データディレクトリにシートが存在するか（restore の上書き確認用）
const hasExistingData = async (dir = config_1.CONFIG_DIR) => {
    const dataFile = path_1.default.join(dir, 'data.json');
    if (!(await fs_extra_1.default.pathExists(dataFile))) {
        return false;
    }
    try {
        const data = await fs_extra_1.default.readJson(dataFile);
        return Array.isArray(data.sheets) && data.sheets.length > 0;
    }
    catch {
        return false;
    }
};
exports.hasExistingData = hasExistingData;
// data.json からシート数を数える（表示用）
const countSheets = async (dir = config_1.CONFIG_DIR) => {
    try {
        const data = await fs_extra_1.default.readJson(path_1.default.join(dir, 'data.json'));
        return Array.isArray(data.sheets) ? data.sheets.length : 0;
    }
    catch {
        return 0;
    }
};
exports.countSheets = countSheets;
//# sourceMappingURL=backup.js.map