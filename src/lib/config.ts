import path from 'path';
import os from 'os';

// 設定ディレクトリのパス
export const CONFIG_DIR = path.join(os.homedir(), '.config', 'cheatsheet-cli');

// 各ファイル・ディレクトリのパス
export const DATA_FILE = path.join(CONFIG_DIR, 'data.json');
export const SHEETS_DIR = path.join(CONFIG_DIR, 'sheets');
export const IMAGES_DIR = path.join(CONFIG_DIR, 'images');

// デフォルトのエディタ
export const getEditor = (): string => {
  return process.env.EDITOR || 'vim';
};
