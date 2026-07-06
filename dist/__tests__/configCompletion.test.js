"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const config_1 = require("../lib/config");
const completion_1 = require("../lib/completion");
(0, vitest_1.describe)('config load/save', () => {
    let testDir;
    let configFile;
    (0, vitest_1.beforeEach)(async () => {
        testDir = await fs_extra_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'cs-config-test-'));
        configFile = path_1.default.join(testDir, 'config.json');
    });
    (0, vitest_1.afterEach)(async () => {
        await fs_extra_1.default.remove(testDir);
    });
    (0, vitest_1.it)('保存して読み込める', () => {
        (0, config_1.saveConfig)({ editor: 'code', dir: '/tmp/sheets' }, configFile);
        (0, vitest_1.expect)((0, config_1.loadConfig)(configFile)).toEqual({ editor: 'code', dir: '/tmp/sheets' });
    });
    (0, vitest_1.it)('存在しないファイルは空設定を返す', () => {
        (0, vitest_1.expect)((0, config_1.loadConfig)(path_1.default.join(testDir, 'nope.json'))).toEqual({});
    });
    (0, vitest_1.it)('壊れたJSONは空設定を返す', async () => {
        await fs_extra_1.default.writeFile(configFile, '{oops', 'utf-8');
        (0, vitest_1.expect)((0, config_1.loadConfig)(configFile)).toEqual({});
    });
    (0, vitest_1.it)('未知のキーや不正な型は無視する', async () => {
        await fs_extra_1.default.writeJson(configFile, { editor: 123, dir: '/x', extra: true });
        (0, vitest_1.expect)((0, config_1.loadConfig)(configFile)).toEqual({ dir: '/x' });
    });
    (0, vitest_1.it)('親ディレクトリがなくても保存できる', () => {
        const nested = path_1.default.join(testDir, 'a', 'b', 'config.json');
        (0, config_1.saveConfig)({ editor: 'nano' }, nested);
        (0, vitest_1.expect)((0, config_1.loadConfig)(nested)).toEqual({ editor: 'nano' });
    });
});
(0, vitest_1.describe)('expandHome', () => {
    (0, vitest_1.it)('~/ をホームに展開する', () => {
        (0, vitest_1.expect)((0, config_1.expandHome)('~/sheets')).toBe(path_1.default.join(os_1.default.homedir(), 'sheets'));
    });
    (0, vitest_1.it)('~ 単体もホームに展開する', () => {
        (0, vitest_1.expect)((0, config_1.expandHome)('~')).toBe(os_1.default.homedir());
    });
    (0, vitest_1.it)('通常のパスはそのまま', () => {
        (0, vitest_1.expect)((0, config_1.expandHome)('/absolute/path')).toBe('/absolute/path');
        (0, vitest_1.expect)((0, config_1.expandHome)('relative/path')).toBe('relative/path');
    });
});
(0, vitest_1.describe)('getCompletionScript', () => {
    (0, vitest_1.it)('zshスクリプトに全コマンドが含まれる', () => {
        const script = (0, completion_1.getCompletionScript)('zsh');
        (0, vitest_1.expect)(script).toBeDefined();
        for (const command of completion_1.COMPLETION_COMMANDS) {
            (0, vitest_1.expect)(script).toContain(command);
        }
        (0, vitest_1.expect)(script).toContain('compdef');
        (0, vitest_1.expect)(script).toContain('cs _names');
    });
    (0, vitest_1.it)('bashスクリプトに全コマンドとcompleteが含まれる', () => {
        const script = (0, completion_1.getCompletionScript)('bash');
        (0, vitest_1.expect)(script).toBeDefined();
        (0, vitest_1.expect)(script).toContain('complete -F');
        (0, vitest_1.expect)(script).toContain('cs _names');
        for (const command of completion_1.SHEET_NAME_COMMANDS) {
            (0, vitest_1.expect)(script).toContain(command);
        }
    });
    (0, vitest_1.it)('未対応シェルはundefined', () => {
        (0, vitest_1.expect)((0, completion_1.getCompletionScript)('fish')).toBeUndefined();
        (0, vitest_1.expect)((0, completion_1.getCompletionScript)('')).toBeUndefined();
    });
});
//# sourceMappingURL=configCompletion.test.js.map