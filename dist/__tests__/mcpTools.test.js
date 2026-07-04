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
// モック後にインポート
const importMcpTools = async () => {
    vitest_1.vi.resetModules();
    return Promise.resolve().then(() => __importStar(require('../lib/mcpTools')));
};
(0, vitest_1.describe)('mcpTools', () => {
    (0, vitest_1.beforeEach)(async () => {
        testDir = await fs_extra_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'cs-mcp-test-'));
    });
    (0, vitest_1.afterEach)(async () => {
        await fs_extra_1.default.remove(testDir);
    });
    (0, vitest_1.describe)('addCheatsheet', () => {
        (0, vitest_1.it)('新しいシートを追加する', async () => {
            const tools = await importMcpTools();
            const result = await tools.addCheatsheet({
                name: 'git-tips',
                content: '# Git\n\n```bash\ngit status\n```\n',
                tags: 'git,vcs',
            });
            (0, vitest_1.expect)(result.isError).toBeUndefined();
            (0, vitest_1.expect)(result.text).toContain('Added cheatsheet "git-tips"');
            (0, vitest_1.expect)(result.text).toContain('git, vcs');
            (0, vitest_1.expect)(await fs_extra_1.default.pathExists(path_1.default.join(testDir, 'sheets', 'git-tips.md'))).toBe(true);
        });
        (0, vitest_1.it)('無効な名前はエラーを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.addCheatsheet({ name: 'bad name', content: 'x' });
            (0, vitest_1.expect)(result.isError).toBe(true);
            (0, vitest_1.expect)(result.text).toContain('alphanumeric');
        });
        (0, vitest_1.it)('空のコンテンツはエラーを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.addCheatsheet({ name: 'empty', content: '   ' });
            (0, vitest_1.expect)(result.isError).toBe(true);
        });
        (0, vitest_1.it)('既存シートはoverwriteなしではエラーを返す', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'dup', content: 'v1' });
            const result = await tools.addCheatsheet({ name: 'dup', content: 'v2' });
            (0, vitest_1.expect)(result.isError).toBe(true);
            (0, vitest_1.expect)(result.text).toContain('already exists');
        });
        (0, vitest_1.it)('overwrite指定で上書きし、タグを引き継ぐ', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'dup', content: 'v1', tags: 'shell' });
            const result = await tools.addCheatsheet({ name: 'dup', content: 'v2', overwrite: true });
            (0, vitest_1.expect)(result.isError).toBeUndefined();
            (0, vitest_1.expect)(result.text).toContain('Updated cheatsheet "dup"');
            (0, vitest_1.expect)(result.text).toContain('shell');
            const content = await fs_extra_1.default.readFile(path_1.default.join(testDir, 'sheets', 'dup.md'), 'utf-8');
            (0, vitest_1.expect)(content).toBe('v2');
        });
        (0, vitest_1.it)('無効なタグはエラーを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.addCheatsheet({ name: 'x', content: 'y', tags: 'ng tag' });
            (0, vitest_1.expect)(result.isError).toBe(true);
            (0, vitest_1.expect)(result.text).toContain('Invalid tag');
        });
    });
    (0, vitest_1.describe)('getCheatsheet', () => {
        (0, vitest_1.it)('シートの内容を返す', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'tar-tips', content: '# Tar\n\ntar -xzvf' });
            const result = await tools.getCheatsheet('tar-tips');
            (0, vitest_1.expect)(result.isError).toBeUndefined();
            (0, vitest_1.expect)(result.text).toBe('# Tar\n\ntar -xzvf');
        });
        (0, vitest_1.it)('存在しないシートはエラーを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.getCheatsheet('nope');
            (0, vitest_1.expect)(result.isError).toBe(true);
            (0, vitest_1.expect)(result.text).toContain('not found');
        });
    });
    (0, vitest_1.describe)('listCheatsheets', () => {
        (0, vitest_1.it)('全シートを一覧する', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'a-sheet', content: 'a', tags: 'git' });
            await tools.addCheatsheet({ name: 'b-sheet', content: 'b' });
            const result = await tools.listCheatsheets();
            (0, vitest_1.expect)(result.text).toContain('2 cheatsheet(s)');
            (0, vitest_1.expect)(result.text).toContain('a-sheet');
            (0, vitest_1.expect)(result.text).toContain('[tags: git]');
            (0, vitest_1.expect)(result.text).toContain('b-sheet');
        });
        (0, vitest_1.it)('タグで絞り込む', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'a-sheet', content: 'a', tags: 'git' });
            await tools.addCheatsheet({ name: 'b-sheet', content: 'b', tags: 'docker' });
            const result = await tools.listCheatsheets('git');
            (0, vitest_1.expect)(result.text).toContain('a-sheet');
            (0, vitest_1.expect)(result.text).not.toContain('b-sheet');
        });
        (0, vitest_1.it)('シートがない場合はメッセージを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.listCheatsheets();
            (0, vitest_1.expect)(result.text).toContain('No cheatsheets found');
            (0, vitest_1.expect)(result.isError).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('searchCheatsheets', () => {
        (0, vitest_1.it)('名前でマッチする', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'git-tips', content: 'commit stuff' });
            const result = await tools.searchCheatsheets('git');
            (0, vitest_1.expect)(result.text).toContain('git-tips');
            (0, vitest_1.expect)(result.text).toContain('matched by name');
        });
        (0, vitest_1.it)('内容でマッチする', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'git-tips', content: 'how to rebase' });
            const result = await tools.searchCheatsheets('rebase');
            (0, vitest_1.expect)(result.text).toContain('matched by content');
        });
        (0, vitest_1.it)('タグのみで検索できる', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'git-tips', content: 'x', tags: 'vcs' });
            const result = await tools.searchCheatsheets(undefined, 'vcs');
            (0, vitest_1.expect)(result.text).toContain('matched by tag');
        });
        (0, vitest_1.it)('キーワードとタグを組み合わせる', async () => {
            const tools = await importMcpTools();
            await tools.addCheatsheet({ name: 'git-tips', content: 'x', tags: 'vcs' });
            await tools.addCheatsheet({ name: 'svn-tips', content: 'x', tags: 'vcs' });
            const result = await tools.searchCheatsheets('git', 'vcs');
            (0, vitest_1.expect)(result.text).toContain('git-tips');
            (0, vitest_1.expect)(result.text).not.toContain('svn-tips');
        });
        (0, vitest_1.it)('条件なしはエラーを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.searchCheatsheets();
            (0, vitest_1.expect)(result.isError).toBe(true);
        });
        (0, vitest_1.it)('ヒットなしはエラーではなくメッセージを返す', async () => {
            const tools = await importMcpTools();
            const result = await tools.searchCheatsheets('nothing');
            (0, vitest_1.expect)(result.isError).toBeUndefined();
            (0, vitest_1.expect)(result.text).toContain('No matching cheatsheets');
        });
    });
});
//# sourceMappingURL=mcpTools.test.js.map