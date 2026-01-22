import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { Sheet, DataStore } from '../types';

// テスト用の一時ディレクトリ
let testDir: string;
let originalConfigDir: string;

// config.tsのモック
vi.mock('../lib/config', async () => {
  const actual = await vi.importActual('../lib/config');
  return {
    ...actual,
    get CONFIG_DIR() { return testDir; },
    get DATA_FILE() { return path.join(testDir, 'data.json'); },
    get SHEETS_DIR() { return path.join(testDir, 'sheets'); },
    get IMAGES_DIR() { return path.join(testDir, 'images'); },
  };
});

// モック後にstorageをインポート
const importStorage = async () => {
  // モジュールキャッシュをクリア
  vi.resetModules();
  return import('../lib/storage');
};

describe('storage', () => {
  beforeEach(async () => {
    // テスト用一時ディレクトリを作成
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cs-test-'));
  });

  afterEach(async () => {
    // テスト用ディレクトリを削除
    await fs.remove(testDir);
  });

  describe('initStorage', () => {
    it('必要なディレクトリとファイルを作成する', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      expect(await fs.pathExists(testDir)).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'sheets'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'images'))).toBe(true);
      expect(await fs.pathExists(path.join(testDir, 'data.json'))).toBe(true);
    });

    it('data.jsonが空のsheets配列を持つ', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const data = await fs.readJson(path.join(testDir, 'data.json'));
      expect(data).toEqual({ sheets: [] });
    });
  });

  describe('loadData / saveData', () => {
    it('データを保存して読み込める', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const testData: DataStore = {
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

      expect(loadedData).toEqual(testData);
    });
  });

  describe('getSheet', () => {
    it('存在するシートを取得できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheet: Sheet = {
        name: 'git-commands',
        type: 'text',
        filename: 'git-commands.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      await storage.saveData({ sheets: [sheet] });
      const result = await storage.getSheet('git-commands');

      expect(result).toEqual(sheet);
    });

    it('存在しないシートはundefinedを返す', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const result = await storage.getSheet('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('addOrUpdateSheet', () => {
    it('新しいシートを追加できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheet: Sheet = {
        name: 'new-sheet',
        type: 'text',
        filename: 'new-sheet.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      await storage.addOrUpdateSheet(sheet);
      const data = await storage.loadData();

      expect(data.sheets).toHaveLength(1);
      expect(data.sheets[0]).toEqual(sheet);
    });

    it('既存のシートを更新できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const originalSheet: Sheet = {
        name: 'my-sheet',
        type: 'text',
        filename: 'my-sheet.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      await storage.addOrUpdateSheet(originalSheet);

      const updatedSheet: Sheet = {
        ...originalSheet,
        updatedAt: '2025-01-02T00:00:00Z',
      };

      await storage.addOrUpdateSheet(updatedSheet);
      const data = await storage.loadData();

      expect(data.sheets).toHaveLength(1);
      expect(data.sheets[0].updatedAt).toBe('2025-01-02T00:00:00Z');
    });
  });

  describe('getAllSheets', () => {
    it('全てのシートを取得できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheets: Sheet[] = [
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

      expect(result).toHaveLength(2);
    });
  });

  describe('removeSheet', () => {
    it('シートを削除できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheet: Sheet = {
        name: 'to-delete',
        type: 'text',
        filename: 'to-delete.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      // シートとファイルを作成
      await storage.addOrUpdateSheet(sheet);
      const sheetsDir = path.join(testDir, 'sheets');
      await fs.writeFile(path.join(sheetsDir, 'to-delete.md'), 'test content');

      const result = await storage.removeSheet('to-delete');
      const data = await storage.loadData();

      expect(result).toBe(true);
      expect(data.sheets).toHaveLength(0);
    });

    it('存在しないシートの削除はfalseを返す', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const result = await storage.removeSheet('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('renameSheet', () => {
    it('シートの名前を変更できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheet: Sheet = {
        name: 'old-name',
        type: 'text',
        filename: 'old-name.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      // シートとファイルを作成
      await storage.addOrUpdateSheet(sheet);
      const sheetsDir = path.join(testDir, 'sheets');
      await fs.writeFile(path.join(sheetsDir, 'old-name.md'), '# Old Name');

      const result = await storage.renameSheet('old-name', 'new-name');
      const data = await storage.loadData();

      expect(result).toBe(true);
      expect(data.sheets).toHaveLength(1);
      expect(data.sheets[0].name).toBe('new-name');
      expect(data.sheets[0].filename).toBe('new-name.md');
      expect(await fs.pathExists(path.join(sheetsDir, 'new-name.md'))).toBe(true);
      expect(await fs.pathExists(path.join(sheetsDir, 'old-name.md'))).toBe(false);
    });

    it('存在しないシートのリネームはfalseを返す', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const result = await storage.renameSheet('non-existent', 'new-name');

      expect(result).toBe(false);
    });

    it('画像シートの名前も変更できる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheet: Sheet = {
        name: 'old-image',
        type: 'image',
        filename: 'old-image.png',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      // シートとファイルを作成
      await storage.addOrUpdateSheet(sheet);
      const imagesDir = path.join(testDir, 'images');
      await fs.writeFile(path.join(imagesDir, 'old-image.png'), 'fake image data');

      const result = await storage.renameSheet('old-image', 'new-image');
      const data = await storage.loadData();

      expect(result).toBe(true);
      expect(data.sheets[0].name).toBe('new-image');
      expect(data.sheets[0].filename).toBe('new-image.png');
      expect(await fs.pathExists(path.join(imagesDir, 'new-image.png'))).toBe(true);
    });
  });

  describe('readSheetContent / writeSheetContent', () => {
    it('シートの内容を読み書きできる', async () => {
      const storage = await importStorage();
      await storage.initStorage();

      const sheet: Sheet = {
        name: 'content-test',
        type: 'text',
        filename: 'content-test.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      await storage.addOrUpdateSheet(sheet);
      await storage.writeSheetContent(sheet, '# Test Content\n\nHello World');
      const content = await storage.readSheetContent(sheet);

      expect(content).toBe('# Test Content\n\nHello World');
    });
  });

  describe('getSheetFilePath', () => {
    it('テキストシートのパスを返す', async () => {
      const storage = await importStorage();

      const sheet: Sheet = {
        name: 'text-sheet',
        type: 'text',
        filename: 'text-sheet.md',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const filePath = storage.getSheetFilePath(sheet);

      expect(filePath).toBe(path.join(testDir, 'sheets', 'text-sheet.md'));
    });

    it('画像シートのパスを返す', async () => {
      const storage = await importStorage();

      const sheet: Sheet = {
        name: 'image-sheet',
        type: 'image',
        filename: 'image-sheet.png',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const filePath = storage.getSheetFilePath(sheet);

      expect(filePath).toBe(path.join(testDir, 'images', 'image-sheet.png'));
    });
  });
});
