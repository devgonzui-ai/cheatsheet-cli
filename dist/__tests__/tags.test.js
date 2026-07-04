"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tags_1 = require("../lib/tags");
const createTestSheet = (name, tags) => ({
    name,
    type: 'text',
    filename: `${name}.md`,
    tags,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
});
(0, vitest_1.describe)('parseTags', () => {
    (0, vitest_1.it)('カンマ区切りの文字列をパースする', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)('git,vcs')).toEqual(['git', 'vcs']);
    });
    (0, vitest_1.it)('前後の空白をトリムする', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)(' git , vcs ')).toEqual(['git', 'vcs']);
    });
    (0, vitest_1.it)('空要素を除去する', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)('git,,vcs,')).toEqual(['git', 'vcs']);
    });
    (0, vitest_1.it)('重複を排除する', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)('git,git,vcs')).toEqual(['git', 'vcs']);
    });
    (0, vitest_1.it)('大文字は小文字に正規化する', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)('Git,VCS')).toEqual(['git', 'vcs']);
    });
    (0, vitest_1.it)('単一タグをパースする', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)('docker')).toEqual(['docker']);
    });
    (0, vitest_1.it)('空文字は空配列を返す', () => {
        (0, vitest_1.expect)((0, tags_1.parseTags)('')).toEqual([]);
    });
});
(0, vitest_1.describe)('validateTags', () => {
    (0, vitest_1.it)('有効なタグは空配列を返す', () => {
        (0, vitest_1.expect)((0, tags_1.validateTags)(['git', 'my-tag', 'tag_2'])).toEqual([]);
    });
    (0, vitest_1.it)('無効なタグを返す', () => {
        (0, vitest_1.expect)((0, tags_1.validateTags)(['git', 'ng tag', 'ng/tag'])).toEqual(['ng tag', 'ng/tag']);
    });
});
(0, vitest_1.describe)('matchByTag', () => {
    (0, vitest_1.it)('タグが一致する場合trueを返す', () => {
        const sheet = createTestSheet('git-commands', ['git', 'vcs']);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(sheet, 'git')).toBe(true);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(sheet, 'vcs')).toBe(true);
    });
    (0, vitest_1.it)('大文字小文字を区別しない', () => {
        const sheet = createTestSheet('git-commands', ['git']);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(sheet, 'GIT')).toBe(true);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(sheet, 'Git')).toBe(true);
    });
    (0, vitest_1.it)('タグが一致しない場合falseを返す', () => {
        const sheet = createTestSheet('git-commands', ['git']);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(sheet, 'docker')).toBe(false);
    });
    (0, vitest_1.it)('部分一致ではマッチしない', () => {
        const sheet = createTestSheet('git-commands', ['github']);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(sheet, 'git')).toBe(false);
    });
    (0, vitest_1.it)('タグがないシートはfalseを返す', () => {
        (0, vitest_1.expect)((0, tags_1.matchByTag)(createTestSheet('no-tags'), 'git')).toBe(false);
        (0, vitest_1.expect)((0, tags_1.matchByTag)(createTestSheet('empty-tags', []), 'git')).toBe(false);
    });
});
(0, vitest_1.describe)('formatTags', () => {
    (0, vitest_1.it)('タグをカンマ区切りで表示する', () => {
        (0, vitest_1.expect)((0, tags_1.formatTags)(['git', 'vcs'])).toBe('git, vcs');
    });
    (0, vitest_1.it)('タグがない場合はハイフンを返す', () => {
        (0, vitest_1.expect)((0, tags_1.formatTags)(undefined)).toBe('-');
        (0, vitest_1.expect)((0, tags_1.formatTags)([])).toBe('-');
    });
});
//# sourceMappingURL=tags.test.js.map