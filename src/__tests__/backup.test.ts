import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import {
  defaultBackupFilename,
  resolveBackupPath,
  createBackup,
  restoreBackup,
  hasExistingData,
  countSheets,
} from '../lib/backup';

let workDir: string;
let dataDir: string;

// テスト用のデータディレクトリを作る
const seedData = async (dir: string, names: string[]): Promise<void> => {
  await fs.ensureDir(path.join(dir, 'sheets'));
  const sheets = names.map((name) => ({
    name,
    type: 'text',
    filename: `${name}.md`,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }));
  await fs.writeJson(path.join(dir, 'data.json'), { sheets });
  for (const name of names) {
    await fs.writeFile(path.join(dir, 'sheets', `${name}.md`), `# ${name}\n`, 'utf-8');
  }
};

beforeEach(async () => {
  workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cs-backup-test-'));
  dataDir = path.join(workDir, 'data');
});

afterEach(async () => {
  await fs.remove(workDir);
});

describe('defaultBackupFilename', () => {
  it('タイムスタンプ付きの名前を生成する', () => {
    const date = new Date(2026, 6, 6, 15, 30, 5);
    expect(defaultBackupFilename(date)).toBe('cheatsheet-backup-20260706-153005.tar.gz');
  });
});

describe('resolveBackupPath', () => {
  const date = new Date(2026, 6, 6, 15, 30, 5);

  it('未指定ならカレントにデフォルト名', () => {
    expect(resolveBackupPath(undefined, '/cwd', date)).toBe(
      '/cwd/cheatsheet-backup-20260706-153005.tar.gz'
    );
  });

  it('既存ディレクトリならその中にデフォルト名', () => {
    expect(resolveBackupPath(workDir, '/cwd', date)).toBe(
      path.join(workDir, 'cheatsheet-backup-20260706-153005.tar.gz')
    );
  });

  it('ファイルパスならそのまま使う（相対はcwd基準）', () => {
    expect(resolveBackupPath('my-backup.tar.gz', workDir, date)).toBe(
      path.join(workDir, 'my-backup.tar.gz')
    );
  });
});

describe('createBackup / restoreBackup', () => {
  it('バックアップして別ディレクトリに復元できる', async () => {
    await seedData(dataDir, ['git-tips', 'tmux']);
    const archive = path.join(workDir, 'backup.tar.gz');

    const entries = await createBackup(archive, dataDir);
    expect(entries).toContain('data.json');
    expect(entries).toContain('sheets');
    expect(await fs.pathExists(archive)).toBe(true);

    const restoreDir = path.join(workDir, 'restored');
    await restoreBackup(archive, restoreDir);

    expect(await countSheets(restoreDir)).toBe(2);
    const content = await fs.readFile(path.join(restoreDir, 'sheets', 'git-tips.md'), 'utf-8');
    expect(content).toBe('# git-tips\n');
  });

  it('復元は既存データを上書きする', async () => {
    await seedData(dataDir, ['original']);
    const archive = path.join(workDir, 'backup.tar.gz');
    await createBackup(archive, dataDir);

    const targetDir = path.join(workDir, 'target');
    await seedData(targetDir, ['old-a', 'old-b']);
    await restoreBackup(archive, targetDir);

    expect(await countSheets(targetDir)).toBe(1);
    expect(await fs.pathExists(path.join(targetDir, 'sheets', 'original.md'))).toBe(true);
  });

  it('空のディレクトリのバックアップはエラー', async () => {
    await fs.ensureDir(dataDir);
    const archive = path.join(workDir, 'backup.tar.gz');
    await expect(createBackup(archive, dataDir)).rejects.toThrow('Nothing to back up');
  });
});

describe('hasExistingData', () => {
  it('シートがあれば true', async () => {
    await seedData(dataDir, ['a']);
    expect(await hasExistingData(dataDir)).toBe(true);
  });

  it('data.json がなければ false', async () => {
    await fs.ensureDir(dataDir);
    expect(await hasExistingData(dataDir)).toBe(false);
  });

  it('シートが空なら false', async () => {
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, 'data.json'), { sheets: [] });
    expect(await hasExistingData(dataDir)).toBe(false);
  });

  it('壊れた data.json は false', async () => {
    await fs.ensureDir(dataDir);
    await fs.writeFile(path.join(dataDir, 'data.json'), '{bad', 'utf-8');
    expect(await hasExistingData(dataDir)).toBe(false);
  });
});
