import path from 'path';
import os from 'os';
import fs from 'fs';

// 設定ファイル（config.json）は常にここに置く（データ保存先とは独立）
export const SETTINGS_DIR = path.join(os.homedir(), '.config', 'cheatsheet-cli');
export const SETTINGS_FILE = path.join(SETTINGS_DIR, 'config.json');

export interface CliConfig {
  editor?: string;
  dir?: string;
}

export const CONFIG_KEYS = ['editor', 'dir'] as const;
export type ConfigKey = (typeof CONFIG_KEYS)[number];

// ~ をホームディレクトリに展開
export const expandHome = (target: string): string => {
  if (target === '~') {
    return os.homedir();
  }
  if (target.startsWith('~/')) {
    return path.join(os.homedir(), target.slice(2));
  }
  return target;
};

// 設定ファイルを読み込む（壊れている・存在しない場合は空設定）
export const loadConfig = (file: string = SETTINGS_FILE): CliConfig => {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }
    const config: CliConfig = {};
    if (typeof parsed.editor === 'string') {
      config.editor = parsed.editor;
    }
    if (typeof parsed.dir === 'string') {
      config.dir = parsed.dir;
    }
    return config;
  } catch {
    return {};
  }
};

// 設定ファイルを保存する
export const saveConfig = (config: CliConfig, file: string = SETTINGS_FILE): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
};

// 起動時に一度だけ読み込む（cs config での変更は次回起動から反映）
const config = loadConfig();

// データ保存先（config.json の dir で変更可能）
export const CONFIG_DIR = config.dir ? path.resolve(expandHome(config.dir)) : SETTINGS_DIR;

// 各ファイル・ディレクトリのパス
export const DATA_FILE = path.join(CONFIG_DIR, 'data.json');
export const SHEETS_DIR = path.join(CONFIG_DIR, 'sheets');
export const IMAGES_DIR = path.join(CONFIG_DIR, 'images');

// エディタ: config.json > $EDITOR > vim
export const getEditor = (): string => {
  return config.editor || process.env.EDITOR || 'vim';
};
