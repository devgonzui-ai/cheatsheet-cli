"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameSheet = exports.copyFile = exports.writeSheetContent = exports.readSheetContent = exports.isValidImageExtension = exports.validateName = exports.getAllSheets = exports.getSheetFilePath = exports.removeSheet = exports.addOrUpdateSheet = exports.getSheet = exports.saveData = exports.loadData = exports.initStorage = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const types_1 = require("../types");
// ストレージの初期化
const initStorage = async () => {
    await fs_extra_1.default.ensureDir(config_1.CONFIG_DIR);
    await fs_extra_1.default.ensureDir(config_1.SHEETS_DIR);
    await fs_extra_1.default.ensureDir(config_1.IMAGES_DIR);
    if (!(await fs_extra_1.default.pathExists(config_1.DATA_FILE))) {
        const initialData = { sheets: [] };
        await fs_extra_1.default.writeJson(config_1.DATA_FILE, initialData, { spaces: 2 });
    }
};
exports.initStorage = initStorage;
// データの読み込み
const loadData = async () => {
    await (0, exports.initStorage)();
    return fs_extra_1.default.readJson(config_1.DATA_FILE);
};
exports.loadData = loadData;
// データの保存
const saveData = async (data) => {
    await fs_extra_1.default.writeJson(config_1.DATA_FILE, data, { spaces: 2 });
};
exports.saveData = saveData;
// シートの取得
const getSheet = async (name) => {
    const data = await (0, exports.loadData)();
    return data.sheets.find((sheet) => sheet.name === name);
};
exports.getSheet = getSheet;
// シートの追加または更新
const addOrUpdateSheet = async (sheet) => {
    const data = await (0, exports.loadData)();
    const existingIndex = data.sheets.findIndex((s) => s.name === sheet.name);
    if (existingIndex >= 0) {
        data.sheets[existingIndex] = sheet;
    }
    else {
        data.sheets.push(sheet);
    }
    await (0, exports.saveData)(data);
};
exports.addOrUpdateSheet = addOrUpdateSheet;
// シートの削除
const removeSheet = async (name) => {
    const data = await (0, exports.loadData)();
    const sheet = data.sheets.find((s) => s.name === name);
    if (!sheet) {
        return false;
    }
    // ファイルを削除
    const filePath = (0, exports.getSheetFilePath)(sheet);
    if (await fs_extra_1.default.pathExists(filePath)) {
        await fs_extra_1.default.remove(filePath);
    }
    // データから削除
    data.sheets = data.sheets.filter((s) => s.name !== name);
    await (0, exports.saveData)(data);
    return true;
};
exports.removeSheet = removeSheet;
// シートファイルのパスを取得
const getSheetFilePath = (sheet) => {
    if (sheet.type === 'text') {
        return path_1.default.join(config_1.SHEETS_DIR, sheet.filename);
    }
    return path_1.default.join(config_1.IMAGES_DIR, sheet.filename);
};
exports.getSheetFilePath = getSheetFilePath;
// 全シートを取得
const getAllSheets = async () => {
    const data = await (0, exports.loadData)();
    return data.sheets;
};
exports.getAllSheets = getAllSheets;
// 名前のバリデーション
const validateName = (name) => {
    return types_1.NAME_PATTERN.test(name);
};
exports.validateName = validateName;
// 画像ファイルの拡張子をチェック
const isValidImageExtension = (filename) => {
    const ext = path_1.default.extname(filename).toLowerCase().slice(1);
    return types_1.SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
};
exports.isValidImageExtension = isValidImageExtension;
// シートの内容を読み込む（テキストのみ）
const readSheetContent = async (sheet) => {
    const filePath = (0, exports.getSheetFilePath)(sheet);
    return fs_extra_1.default.readFile(filePath, 'utf-8');
};
exports.readSheetContent = readSheetContent;
// シートの内容を書き込む（テキストのみ）
const writeSheetContent = async (sheet, content) => {
    const filePath = (0, exports.getSheetFilePath)(sheet);
    await fs_extra_1.default.writeFile(filePath, content, 'utf-8');
};
exports.writeSheetContent = writeSheetContent;
// ファイルをコピー
const copyFile = async (src, dest) => {
    await fs_extra_1.default.copy(src, dest);
};
exports.copyFile = copyFile;
// シートの名前を変更
const renameSheet = async (oldName, newName) => {
    const data = await (0, exports.loadData)();
    const sheet = data.sheets.find((s) => s.name === oldName);
    if (!sheet) {
        return false;
    }
    // 古いファイルパス
    const oldFilePath = (0, exports.getSheetFilePath)(sheet);
    // 新しいファイル名を生成
    const ext = path_1.default.extname(sheet.filename);
    const newFilename = `${newName}${ext}`;
    // 新しいファイルパス
    const newFilePath = sheet.type === 'text'
        ? path_1.default.join(config_1.SHEETS_DIR, newFilename)
        : path_1.default.join(config_1.IMAGES_DIR, newFilename);
    // ファイルをリネーム
    if (await fs_extra_1.default.pathExists(oldFilePath)) {
        await fs_extra_1.default.rename(oldFilePath, newFilePath);
    }
    // メタデータを更新
    sheet.name = newName;
    sheet.filename = newFilename;
    sheet.updatedAt = new Date().toISOString();
    await (0, exports.saveData)(data);
    return true;
};
exports.renameSheet = renameSheet;
//# sourceMappingURL=storage.js.map