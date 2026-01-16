import fs from 'fs-extra';
import path from 'path';
import { CONFIG_DIR, DATA_FILE, SHEETS_DIR, IMAGES_DIR } from './config';
import { DataStore, Sheet, NAME_PATTERN, SUPPORTED_IMAGE_EXTENSIONS } from '../types';

// ストレージの初期化
export const initStorage = async (): Promise<void> => {
  await fs.ensureDir(CONFIG_DIR);
  await fs.ensureDir(SHEETS_DIR);
  await fs.ensureDir(IMAGES_DIR);

  if (!(await fs.pathExists(DATA_FILE))) {
    const initialData: DataStore = { sheets: [] };
    await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
  }
};

// データの読み込み
export const loadData = async (): Promise<DataStore> => {
  await initStorage();
  return fs.readJson(DATA_FILE);
};

// データの保存
export const saveData = async (data: DataStore): Promise<void> => {
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
};

// シートの取得
export const getSheet = async (name: string): Promise<Sheet | undefined> => {
  const data = await loadData();
  return data.sheets.find((sheet) => sheet.name === name);
};

// シートの追加または更新
export const addOrUpdateSheet = async (sheet: Sheet): Promise<void> => {
  const data = await loadData();
  const existingIndex = data.sheets.findIndex((s) => s.name === sheet.name);

  if (existingIndex >= 0) {
    data.sheets[existingIndex] = sheet;
  } else {
    data.sheets.push(sheet);
  }

  await saveData(data);
};

// シートの削除
export const removeSheet = async (name: string): Promise<boolean> => {
  const data = await loadData();
  const sheet = data.sheets.find((s) => s.name === name);

  if (!sheet) {
    return false;
  }

  // ファイルを削除
  const filePath = getSheetFilePath(sheet);
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
  }

  // データから削除
  data.sheets = data.sheets.filter((s) => s.name !== name);
  await saveData(data);

  return true;
};

// シートファイルのパスを取得
export const getSheetFilePath = (sheet: Sheet): string => {
  if (sheet.type === 'text') {
    return path.join(SHEETS_DIR, sheet.filename);
  }
  return path.join(IMAGES_DIR, sheet.filename);
};

// 全シートを取得
export const getAllSheets = async (): Promise<Sheet[]> => {
  const data = await loadData();
  return data.sheets;
};

// 名前のバリデーション
export const validateName = (name: string): boolean => {
  return NAME_PATTERN.test(name);
};

// 画像ファイルの拡張子をチェック
export const isValidImageExtension = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return (SUPPORTED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
};

// シートの内容を読み込む（テキストのみ）
export const readSheetContent = async (sheet: Sheet): Promise<string> => {
  const filePath = getSheetFilePath(sheet);
  return fs.readFile(filePath, 'utf-8');
};

// シートの内容を書き込む（テキストのみ）
export const writeSheetContent = async (sheet: Sheet, content: string): Promise<void> => {
  const filePath = getSheetFilePath(sheet);
  await fs.writeFile(filePath, content, 'utf-8');
};

// ファイルをコピー
export const copyFile = async (src: string, dest: string): Promise<void> => {
  await fs.copy(src, dest);
};
