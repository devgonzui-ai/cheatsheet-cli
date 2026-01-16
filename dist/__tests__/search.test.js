"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const search_1 = require("../lib/search");
const createTestSheet = (name, type = 'text') => ({
    name,
    type,
    filename: `${name}.${type === 'text' ? 'md' : 'png'}`,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
});
(0, vitest_1.describe)('matchByName', () => {
    (0, vitest_1.it)('名前に完全一致する場合trueを返す', () => {
        const sheet = createTestSheet('git-commands');
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'git-commands')).toBe(true);
    });
    (0, vitest_1.it)('名前に部分一致する場合trueを返す', () => {
        const sheet = createTestSheet('git-commands');
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'git')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'commands')).toBe(true);
    });
    (0, vitest_1.it)('大文字小文字を区別しない', () => {
        const sheet = createTestSheet('Git-Commands');
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'git')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'GIT')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'Git')).toBe(true);
    });
    (0, vitest_1.it)('一致しない場合falseを返す', () => {
        const sheet = createTestSheet('git-commands');
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'docker')).toBe(false);
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, 'vim')).toBe(false);
    });
    (0, vitest_1.it)('空文字は全てにマッチする', () => {
        const sheet = createTestSheet('git-commands');
        (0, vitest_1.expect)((0, search_1.matchByName)(sheet, '')).toBe(true);
    });
});
(0, vitest_1.describe)('matchByContent', () => {
    (0, vitest_1.it)('コンテンツに完全一致する場合trueを返す', () => {
        const content = 'git commit -m "message"';
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'git commit')).toBe(true);
    });
    (0, vitest_1.it)('コンテンツに部分一致する場合trueを返す', () => {
        const content = 'Use git to manage your code';
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'git')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'code')).toBe(true);
    });
    (0, vitest_1.it)('大文字小文字を区別しない', () => {
        const content = 'Git is a version control system';
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'git')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'GIT')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'Version')).toBe(true);
    });
    (0, vitest_1.it)('一致しない場合falseを返す', () => {
        const content = 'git commit -m "message"';
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'docker')).toBe(false);
    });
    (0, vitest_1.it)('複数行のコンテンツを検索できる', () => {
        const content = `# Git Commands

## Commit
git commit -m "message"

## Push
git push origin main`;
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'commit')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'push')).toBe(true);
        (0, vitest_1.expect)((0, search_1.matchByContent)(content, 'origin')).toBe(true);
    });
});
(0, vitest_1.describe)('createSearchResult', () => {
    (0, vitest_1.it)('名前マッチの結果を生成する', () => {
        const sheet = createTestSheet('git-commands');
        const result = (0, search_1.createSearchResult)(sheet, 'name');
        (0, vitest_1.expect)(result).toEqual({
            name: 'git-commands',
            type: 'text',
            matchType: 'name',
        });
    });
    (0, vitest_1.it)('コンテンツマッチの結果を生成する', () => {
        const sheet = createTestSheet('git-commands');
        const result = (0, search_1.createSearchResult)(sheet, 'content');
        (0, vitest_1.expect)(result).toEqual({
            name: 'git-commands',
            type: 'text',
            matchType: 'content',
        });
    });
    (0, vitest_1.it)('画像タイプのシートの結果を生成する', () => {
        const sheet = createTestSheet('vim-cheatsheet', 'image');
        const result = (0, search_1.createSearchResult)(sheet, 'name');
        (0, vitest_1.expect)(result).toEqual({
            name: 'vim-cheatsheet',
            type: 'image',
            matchType: 'name',
        });
    });
});
(0, vitest_1.describe)('searchSheetsByName', () => {
    const sheets = [
        createTestSheet('git-commands'),
        createTestSheet('git-rebase'),
        createTestSheet('docker-compose'),
        createTestSheet('vim-basics'),
    ];
    (0, vitest_1.it)('名前でシートを検索する', () => {
        const results = (0, search_1.searchSheetsByName)(sheets, 'git');
        (0, vitest_1.expect)(results).toHaveLength(2);
        (0, vitest_1.expect)(results.map(r => r.name)).toContain('git-commands');
        (0, vitest_1.expect)(results.map(r => r.name)).toContain('git-rebase');
    });
    (0, vitest_1.it)('一致するシートがない場合空配列を返す', () => {
        const results = (0, search_1.searchSheetsByName)(sheets, 'kubernetes');
        (0, vitest_1.expect)(results).toHaveLength(0);
    });
    (0, vitest_1.it)('単一の結果を返す', () => {
        const results = (0, search_1.searchSheetsByName)(sheets, 'docker');
        (0, vitest_1.expect)(results).toHaveLength(1);
        (0, vitest_1.expect)(results[0].name).toBe('docker-compose');
    });
    (0, vitest_1.it)('全てのシートを返す（空文字検索）', () => {
        const results = (0, search_1.searchSheetsByName)(sheets, '');
        (0, vitest_1.expect)(results).toHaveLength(4);
    });
    (0, vitest_1.it)('結果のmatchTypeはnameになる', () => {
        const results = (0, search_1.searchSheetsByName)(sheets, 'vim');
        (0, vitest_1.expect)(results).toHaveLength(1);
        (0, vitest_1.expect)(results[0].matchType).toBe('name');
    });
});
//# sourceMappingURL=search.test.js.map