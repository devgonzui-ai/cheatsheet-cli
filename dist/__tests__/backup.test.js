"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const backup_1 = require("../lib/backup");
let workDir;
let dataDir;
// テスト用のデータディレクトリを作る
const seedData = async (dir, names) => {
    await fs_extra_1.default.ensureDir(path_1.default.join(dir, 'sheets'));
    const sheets = names.map((name) => ({
        name,
        type: 'text',
        filename: `${name}.md`,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    }));
    await fs_extra_1.default.writeJson(path_1.default.join(dir, 'data.json'), { sheets });
    for (const name of names) {
        await fs_extra_1.default.writeFile(path_1.default.join(dir, 'sheets', `${name}.md`), `# ${name}\n`, 'utf-8');
    }
};
(0, vitest_1.beforeEach)(async () => {
    workDir = await fs_extra_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'cs-backup-test-'));
    dataDir = path_1.default.join(workDir, 'data');
});
(0, vitest_1.afterEach)(async () => {
    await fs_extra_1.default.remove(workDir);
});
(0, vitest_1.describe)('defaultBackupFilename', () => {
    (0, vitest_1.it)('タイムスタンプ付きの名前を生成する', () => {
        const date = new Date(2026, 6, 6, 15, 30, 5);
        (0, vitest_1.expect)((0, backup_1.defaultBackupFilename)(date)).toBe('cheatsheet-backup-20260706-153005.tar.gz');
    });
});
(0, vitest_1.describe)('resolveBackupPath', () => {
    const date = new Date(2026, 6, 6, 15, 30, 5);
    (0, vitest_1.it)('未指定ならカレントにデフォルト名', () => {
        (0, vitest_1.expect)((0, backup_1.resolveBackupPath)(undefined, '/cwd', date)).toBe('/cwd/cheatsheet-backup-20260706-153005.tar.gz');
    });
    (0, vitest_1.it)('既存ディレクトリならその中にデフォルト名', () => {
        (0, vitest_1.expect)((0, backup_1.resolveBackupPath)(workDir, '/cwd', date)).toBe(path_1.default.join(workDir, 'cheatsheet-backup-20260706-153005.tar.gz'));
    });
    (0, vitest_1.it)('ファイルパスならそのまま使う（相対はcwd基準）', () => {
        (0, vitest_1.expect)((0, backup_1.resolveBackupPath)('my-backup.tar.gz', workDir, date)).toBe(path_1.default.join(workDir, 'my-backup.tar.gz'));
    });
});
(0, vitest_1.describe)('createBackup / restoreBackup', () => {
    (0, vitest_1.it)('バックアップして別ディレクトリに復元できる', async () => {
        await seedData(dataDir, ['git-tips', 'tmux']);
        const archive = path_1.default.join(workDir, 'backup.tar.gz');
        const entries = await (0, backup_1.createBackup)(archive, dataDir);
        (0, vitest_1.expect)(entries).toContain('data.json');
        (0, vitest_1.expect)(entries).toContain('sheets');
        (0, vitest_1.expect)(await fs_extra_1.default.pathExists(archive)).toBe(true);
        const restoreDir = path_1.default.join(workDir, 'restored');
        await (0, backup_1.restoreBackup)(archive, restoreDir);
        (0, vitest_1.expect)(await (0, backup_1.countSheets)(restoreDir)).toBe(2);
        const content = await fs_extra_1.default.readFile(path_1.default.join(restoreDir, 'sheets', 'git-tips.md'), 'utf-8');
        (0, vitest_1.expect)(content).toBe('# git-tips\n');
    });
    (0, vitest_1.it)('復元は既存データを上書きする', async () => {
        await seedData(dataDir, ['original']);
        const archive = path_1.default.join(workDir, 'backup.tar.gz');
        await (0, backup_1.createBackup)(archive, dataDir);
        const targetDir = path_1.default.join(workDir, 'target');
        await seedData(targetDir, ['old-a', 'old-b']);
        await (0, backup_1.restoreBackup)(archive, targetDir);
        (0, vitest_1.expect)(await (0, backup_1.countSheets)(targetDir)).toBe(1);
        (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(targetDir, 'sheets', 'original.md'))).toBe(true);
    });
    (0, vitest_1.it)('空のディレクトリのバックアップはエラー', async () => {
        await fs_extra_1.default.ensureDir(dataDir);
        const archive = path_1.default.join(workDir, 'backup.tar.gz');
        await (0, vitest_1.expect)((0, backup_1.createBackup)(archive, dataDir)).rejects.toThrow('Nothing to back up');
    });
});
(0, vitest_1.describe)('hasExistingData', () => {
    (0, vitest_1.it)('シートがあれば true', async () => {
        await seedData(dataDir, ['a']);
        (0, vitest_1.expect)(await (0, backup_1.hasExistingData)(dataDir)).toBe(true);
    });
    (0, vitest_1.it)('data.json がなければ false', async () => {
        await fs_extra_1.default.ensureDir(dataDir);
        (0, vitest_1.expect)(await (0, backup_1.hasExistingData)(dataDir)).toBe(false);
    });
    (0, vitest_1.it)('シートが空なら false', async () => {
        await fs_extra_1.default.ensureDir(dataDir);
        await fs_extra_1.default.writeJson(path_1.default.join(dataDir, 'data.json'), { sheets: [] });
        (0, vitest_1.expect)(await (0, backup_1.hasExistingData)(dataDir)).toBe(false);
    });
    (0, vitest_1.it)('壊れた data.json は false', async () => {
        await fs_extra_1.default.ensureDir(dataDir);
        await fs_extra_1.default.writeFile(path_1.default.join(dataDir, 'data.json'), '{bad', 'utf-8');
        (0, vitest_1.expect)(await (0, backup_1.hasExistingData)(dataDir)).toBe(false);
    });
});
//# sourceMappingURL=backup.test.js.map