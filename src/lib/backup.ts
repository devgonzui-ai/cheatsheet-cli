import path from 'path';
import fs from 'fs-extra';
import * as tar from 'tar';
import { CONFIG_DIR } from './config';

// バックアップ対象のエントリ（データディレクトリ直下）
const BACKUP_ENTRIES = ['data.json', 'sheets', 'images'];

// タイムスタンプ付きのデフォルトファイル名（例: cheatsheet-backup-20260706-153000.tar.gz）
export const defaultBackupFilename = (date: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `cheatsheet-backup-${stamp}.tar.gz`;
};

// --out の解釈: 未指定→カレント、既存ディレクトリ→その中、それ以外→そのままファイルパス
export const resolveBackupPath = (
  out: string | undefined,
  cwd: string,
  date?: Date
): string => {
  if (!out) {
    return path.join(cwd, defaultBackupFilename(date));
  }
  const resolved = path.resolve(cwd, out);
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    return path.join(resolved, defaultBackupFilename(date));
  }
  return resolved;
};

// データディレクトリを tar.gz に固める。アーカイブしたエントリ名を返す
export const createBackup = async (
  file: string,
  fromDir: string = CONFIG_DIR
): Promise<string[]> => {
  const entries = BACKUP_ENTRIES.filter((entry) => fs.existsSync(path.join(fromDir, entry)));
  if (entries.length === 0) {
    throw new Error(`Nothing to back up in ${fromDir}`);
  }
  await fs.ensureDir(path.dirname(file));
  await tar.create({ gzip: true, file, cwd: fromDir }, entries);
  return entries;
};

// tar.gz をデータディレクトリに展開する（既存ファイルは上書き）
export const restoreBackup = async (
  file: string,
  toDir: string = CONFIG_DIR
): Promise<void> => {
  await fs.ensureDir(toDir);
  await tar.extract({ file, cwd: toDir });
};

// データディレクトリにシートが存在するか（restore の上書き確認用）
export const hasExistingData = async (dir: string = CONFIG_DIR): Promise<boolean> => {
  const dataFile = path.join(dir, 'data.json');
  if (!(await fs.pathExists(dataFile))) {
    return false;
  }
  try {
    const data = await fs.readJson(dataFile);
    return Array.isArray(data.sheets) && data.sheets.length > 0;
  } catch {
    return false;
  }
};

// data.json からシート数を数える（表示用）
export const countSheets = async (dir: string = CONFIG_DIR): Promise<number> => {
  try {
    const data = await fs.readJson(path.join(dir, 'data.json'));
    return Array.isArray(data.sheets) ? data.sheets.length : 0;
  } catch {
    return 0;
  }
};
