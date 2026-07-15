"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const search_1 = require("../lib/search");
const interactive_1 = require("../commands/interactive");
const makeSheet = (name) => ({
    name,
    type: 'text',
    filename: `${name}.md`,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
});
(0, vitest_1.describe)('fuzzyMatch', () => {
    (0, vitest_1.it)('文字が順番どおりに現れればマッチする', () => {
        (0, vitest_1.expect)((0, search_1.fuzzyMatch)('git-commands', 'gitcmd')).toBe(true);
        (0, vitest_1.expect)((0, search_1.fuzzyMatch)('docker-tips', 'dktp')).toBe(true);
    });
    (0, vitest_1.it)('大文字小文字を無視する', () => {
        (0, vitest_1.expect)((0, search_1.fuzzyMatch)('Git-Commands', 'GITCMD')).toBe(true);
    });
    (0, vitest_1.it)('順番が違えばマッチしない', () => {
        (0, vitest_1.expect)((0, search_1.fuzzyMatch)('git-commands', 'cmdgit')).toBe(false);
    });
    (0, vitest_1.it)('存在しない文字はマッチしない', () => {
        (0, vitest_1.expect)((0, search_1.fuzzyMatch)('git', 'gitz')).toBe(false);
    });
    (0, vitest_1.it)('空キーワードは常にマッチ', () => {
        (0, vitest_1.expect)((0, search_1.fuzzyMatch)('anything', '')).toBe(true);
    });
});
(0, vitest_1.describe)('findMatchingLines', () => {
    const content = '# Git\n\ngit status\ngit commit -m "msg"\nGIT COMMIT amend\ngit push';
    (0, vitest_1.it)('マッチする行を行番号付きで返す', () => {
        const result = (0, search_1.findMatchingLines)(content, 'commit');
        (0, vitest_1.expect)(result).toEqual([
            { lineNumber: 4, line: 'git commit -m "msg"' },
            { lineNumber: 5, line: 'GIT COMMIT amend' },
        ]);
    });
    (0, vitest_1.it)('limitで件数を制限する', () => {
        const result = (0, search_1.findMatchingLines)(content, 'git', 2);
        (0, vitest_1.expect)(result).toHaveLength(2);
        (0, vitest_1.expect)(result[0].lineNumber).toBe(1);
    });
    (0, vitest_1.it)('マッチなしは空配列', () => {
        (0, vitest_1.expect)((0, search_1.findMatchingLines)(content, 'docker')).toEqual([]);
    });
    (0, vitest_1.it)('行の前後空白はトリムされる', () => {
        const result = (0, search_1.findMatchingLines)('   indented match   ', 'match');
        (0, vitest_1.expect)(result[0].line).toBe('indented match');
    });
});
(0, vitest_1.describe)('highlightKeyword', () => {
    const wrap = (s) => `<${s}>`;
    (0, vitest_1.it)('キーワードを装飾する', () => {
        (0, vitest_1.expect)((0, search_1.highlightKeyword)('git commit now', 'commit', wrap)).toBe('git <commit> now');
    });
    (0, vitest_1.it)('大文字小文字を無視しつつ元の表記を保持する', () => {
        (0, vitest_1.expect)((0, search_1.highlightKeyword)('Git COMMIT now', 'commit', wrap)).toBe('Git <COMMIT> now');
    });
    (0, vitest_1.it)('複数出現をすべて装飾する', () => {
        (0, vitest_1.expect)((0, search_1.highlightKeyword)('aXbXc', 'x', wrap)).toBe('a<X>b<X>c');
    });
    (0, vitest_1.it)('マッチなしはそのまま返す', () => {
        (0, vitest_1.expect)((0, search_1.highlightKeyword)('hello', 'zzz', wrap)).toBe('hello');
    });
    (0, vitest_1.it)('空キーワードはそのまま返す', () => {
        (0, vitest_1.expect)((0, search_1.highlightKeyword)('hello', '', wrap)).toBe('hello');
    });
});
(0, vitest_1.describe)('filterSheets', () => {
    const sheets = [makeSheet('git-commands'), makeSheet('docker-tips'), makeSheet('tmux')];
    (0, vitest_1.it)('空入力は全件返す', () => {
        (0, vitest_1.expect)((0, interactive_1.filterSheets)(sheets, '')).toHaveLength(3);
    });
    (0, vitest_1.it)('部分一致でフィルタする', () => {
        const result = (0, interactive_1.filterSheets)(sheets, 'docker');
        (0, vitest_1.expect)(result.map((s) => s.name)).toEqual(['docker-tips']);
    });
    (0, vitest_1.it)('fuzzyでもフィルタでき、部分一致が先に並ぶ', () => {
        const result = (0, interactive_1.filterSheets)([makeSheet('git-commands'), makeSheet('gcm-tool')], 'gcm');
        (0, vitest_1.expect)(result.map((s) => s.name)).toEqual(['gcm-tool', 'git-commands']);
    });
    (0, vitest_1.it)('どちらにもマッチしなければ空', () => {
        (0, vitest_1.expect)((0, interactive_1.filterSheets)(sheets, 'zzz')).toEqual([]);
    });
});
//# sourceMappingURL=searchExtras.test.js.map