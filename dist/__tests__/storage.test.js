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
const vitest_1 = require("vitest");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
// テスト用の一時ディレクトリ
let testDir;
let originalConfigDir;
// config.tsのモック
vitest_1.vi.mock('../lib/config', async () => {
    const actual = await vitest_1.vi.importActual('../lib/config');
    return {
        ...actual,
        get CONFIG_DIR() { return testDir; },
        get DATA_FILE() { return path_1.default.join(testDir, 'data.json'); },
        get SHEETS_DIR() { return path_1.default.join(testDir, 'sheets'); },
        get IMAGES_DIR() { return path_1.default.join(testDir, 'images'); },
    };
});
// モック後にstorageをインポート
const importStorage = async () => {
    // モジュールキャッシュをクリア
    vitest_1.vi.resetModules();
    return Promise.resolve().then(() => __importStar(require('../lib/storage')));
};
(0, vitest_1.describe)('storage', () => {
    (0, vitest_1.beforeEach)(async () => {
        // テスト用一時ディレクトリを作成
        testDir = await fs_extra_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'cs-test-'));
    });
    (0, vitest_1.afterEach)(async () => {
        // テスト用ディレクトリを削除
        await fs_extra_1.default.remove(testDir);
    });
    (0, vitest_1.describe)('initStorage', () => {
        (0, vitest_1.it)('必要なディレクトリとファイルを作成する', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(testDir)).toBe(true);
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(testDir, 'sheets'))).toBe(true);
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(testDir, 'images'))).toBe(true);
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(testDir, 'data.json'))).toBe(true);
        });
        (0, vitest_1.it)('data.jsonが空のsheets配列を持つ', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const data = await fs_extra_1.default.readJson(path_1.default.join(testDir, 'data.json'));
            (0, vitest_1.expect)(data).toEqual({ sheets: [] });
        });
    });
    (0, vitest_1.describe)('loadData / saveData', () => {
        (0, vitest_1.it)('データを保存して読み込める', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const testData = {
                sheets: [
                    {
                        name: 'test-sheet',
                        type: 'text',
                        filename: 'test-sheet.md',
                        createdAt: '2025-01-01T00:00:00Z',
                        updatedAt: '2025-01-01T00:00:00Z',
                    },
                ],
            };
            await storage.saveData(testData);
            const loadedData = await storage.loadData();
            (0, vitest_1.expect)(loadedData).toEqual(testData);
        });
    });
    (0, vitest_1.describe)('getSheet', () => {
        (0, vitest_1.it)('存在するシートを取得できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheet = {
                name: 'git-commands',
                type: 'text',
                filename: 'git-commands.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            await storage.saveData({ sheets: [sheet] });
            const result = await storage.getSheet('git-commands');
            (0, vitest_1.expect)(result).toEqual(sheet);
        });
        (0, vitest_1.it)('存在しないシートはundefinedを返す', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const result = await storage.getSheet('non-existent');
            (0, vitest_1.expect)(result).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('addOrUpdateSheet', () => {
        (0, vitest_1.it)('新しいシートを追加できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheet = {
                name: 'new-sheet',
                type: 'text',
                filename: 'new-sheet.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            await storage.addOrUpdateSheet(sheet);
            const data = await storage.loadData();
            (0, vitest_1.expect)(data.sheets).toHaveLength(1);
            (0, vitest_1.expect)(data.sheets[0]).toEqual(sheet);
        });
        (0, vitest_1.it)('既存のシートを更新できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const originalSheet = {
                name: 'my-sheet',
                type: 'text',
                filename: 'my-sheet.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            await storage.addOrUpdateSheet(originalSheet);
            const updatedSheet = {
                ...originalSheet,
                updatedAt: '2025-01-02T00:00:00Z',
            };
            await storage.addOrUpdateSheet(updatedSheet);
            const data = await storage.loadData();
            (0, vitest_1.expect)(data.sheets).toHaveLength(1);
            (0, vitest_1.expect)(data.sheets[0].updatedAt).toBe('2025-01-02T00:00:00Z');
        });
    });
    (0, vitest_1.describe)('getAllSheets', () => {
        (0, vitest_1.it)('全てのシートを取得できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheets = [
                {
                    name: 'sheet1',
                    type: 'text',
                    filename: 'sheet1.md',
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-01T00:00:00Z',
                },
                {
                    name: 'sheet2',
                    type: 'text',
                    filename: 'sheet2.md',
                    createdAt: '2025-01-02T00:00:00Z',
                    updatedAt: '2025-01-02T00:00:00Z',
                },
            ];
            await storage.saveData({ sheets });
            const result = await storage.getAllSheets();
            (0, vitest_1.expect)(result).toHaveLength(2);
        });
    });
    (0, vitest_1.describe)('removeSheet', () => {
        (0, vitest_1.it)('シートを削除できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheet = {
                name: 'to-delete',
                type: 'text',
                filename: 'to-delete.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            // シートとファイルを作成
            await storage.addOrUpdateSheet(sheet);
            const sheetsDir = path_1.default.join(testDir, 'sheets');
            await fs_extra_1.default.writeFile(path_1.default.join(sheetsDir, 'to-delete.md'), 'test content');
            const result = await storage.removeSheet('to-delete');
            const data = await storage.loadData();
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(data.sheets).toHaveLength(0);
        });
        (0, vitest_1.it)('存在しないシートの削除はfalseを返す', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const result = await storage.removeSheet('non-existent');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('renameSheet', () => {
        (0, vitest_1.it)('シートの名前を変更できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheet = {
                name: 'old-name',
                type: 'text',
                filename: 'old-name.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            // シートとファイルを作成
            await storage.addOrUpdateSheet(sheet);
            const sheetsDir = path_1.default.join(testDir, 'sheets');
            await fs_extra_1.default.writeFile(path_1.default.join(sheetsDir, 'old-name.md'), '# Old Name');
            const result = await storage.renameSheet('old-name', 'new-name');
            const data = await storage.loadData();
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(data.sheets).toHaveLength(1);
            (0, vitest_1.expect)(data.sheets[0].name).toBe('new-name');
            (0, vitest_1.expect)(data.sheets[0].filename).toBe('new-name.md');
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(sheetsDir, 'new-name.md'))).toBe(true);
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(sheetsDir, 'old-name.md'))).toBe(false);
        });
        (0, vitest_1.it)('存在しないシートのリネームはfalseを返す', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const result = await storage.renameSheet('non-existent', 'new-name');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('画像シートの名前も変更できる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheet = {
                name: 'old-image',
                type: 'image',
                filename: 'old-image.png',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            // シートとファイルを作成
            await storage.addOrUpdateSheet(sheet);
            const imagesDir = path_1.default.join(testDir, 'images');
            await fs_extra_1.default.writeFile(path_1.default.join(imagesDir, 'old-image.png'), 'fake image data');
            const result = await storage.renameSheet('old-image', 'new-image');
            const data = await storage.loadData();
            (0, vitest_1.expect)(result).toBe(true);
            (0, vitest_1.expect)(data.sheets[0].name).toBe('new-image');
            (0, vitest_1.expect)(data.sheets[0].filename).toBe('new-image.png');
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(imagesDir, 'new-image.png'))).toBe(true);
        });
    });
    (0, vitest_1.describe)('readSheetContent / writeSheetContent', () => {
        (0, vitest_1.it)('シートの内容を読み書きできる', async () => {
            const storage = await importStorage();
            await storage.initStorage();
            const sheet = {
                name: 'content-test',
                type: 'text',
                filename: 'content-test.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            await storage.addOrUpdateSheet(sheet);
            await storage.writeSheetContent(sheet, '# Test Content\n\nHello World');
            const content = await storage.readSheetContent(sheet);
            (0, vitest_1.expect)(content).toBe('# Test Content\n\nHello World');
        });
    });
    (0, vitest_1.describe)('getSheetFilePath', () => {
        (0, vitest_1.it)('テキストシートのパスを返す', async () => {
            const storage = await importStorage();
            const sheet = {
                name: 'text-sheet',
                type: 'text',
                filename: 'text-sheet.md',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            const filePath = storage.getSheetFilePath(sheet);
            (0, vitest_1.expect)(filePath).toBe(path_1.default.join(testDir, 'sheets', 'text-sheet.md'));
        });
        (0, vitest_1.it)('画像シートのパスを返す', async () => {
            const storage = await importStorage();
            const sheet = {
                name: 'image-sheet',
                type: 'image',
                filename: 'image-sheet.png',
                createdAt: '2025-01-01T00:00:00Z',
                updatedAt: '2025-01-01T00:00:00Z',
            };
            const filePath = storage.getSheetFilePath(sheet);
            (0, vitest_1.expect)(filePath).toBe(path_1.default.join(testDir, 'images', 'image-sheet.png'));
        });
    });
});
//# sourceMappingURL=storage.test.js.map