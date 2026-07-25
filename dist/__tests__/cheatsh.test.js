"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const cheatsh_1 = require("../lib/cheatsh");
const ESC = String.fromCharCode(27);
// fetch の代わりに使うスタブ
const fakeFetch = (body, init = {}) => {
    const { ok = true, status = 200, statusText = 'OK' } = init;
    return (async () => ({
        ok,
        status,
        statusText,
        text: async () => body,
    }));
};
(0, vitest_1.describe)('validateTopic', () => {
    (0, vitest_1.it)('英数と - _ . + / を許可する', () => {
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('tar')).toBe(true);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('python/lists')).toBe(true);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('go/reverse+string')).toBe(true);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('c++')).toBe(true);
    });
    (0, vitest_1.it)('空文字やスペース、クエリ文字は弾く', () => {
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('')).toBe(false);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('git log')).toBe(false);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('tar?T=1')).toBe(false);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('tar#frag')).toBe(false);
    });
    (0, vitest_1.it)('親ディレクトリ参照は弾く', () => {
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('../etc/passwd')).toBe(false);
        (0, vitest_1.expect)((0, cheatsh_1.validateTopic)('python/../..')).toBe(false);
    });
});
(0, vitest_1.describe)('topicToSheetName', () => {
    (0, vitest_1.it)('/ + . を - に畳む', () => {
        (0, vitest_1.expect)((0, cheatsh_1.topicToSheetName)('tar')).toBe('tar');
        (0, vitest_1.expect)((0, cheatsh_1.topicToSheetName)('python/lists')).toBe('python-lists');
        (0, vitest_1.expect)((0, cheatsh_1.topicToSheetName)('go/reverse+string')).toBe('go-reverse-string');
        (0, vitest_1.expect)((0, cheatsh_1.topicToSheetName)('c++')).toBe('c');
    });
    (0, vitest_1.it)('連続する区切りと前後の - を落とす', () => {
        (0, vitest_1.expect)((0, cheatsh_1.topicToSheetName)('a//b')).toBe('a-b');
        (0, vitest_1.expect)((0, cheatsh_1.topicToSheetName)('.hidden.')).toBe('hidden');
    });
});
(0, vitest_1.describe)('buildUrl', () => {
    (0, vitest_1.it)('プレーンテキストを要求する ?T を付ける', () => {
        (0, vitest_1.expect)((0, cheatsh_1.buildUrl)('tar')).toBe('https://cheat.sh/tar?T');
        (0, vitest_1.expect)((0, cheatsh_1.buildUrl)('python/lists')).toBe('https://cheat.sh/python/lists?T');
    });
});
(0, vitest_1.describe)('stripAnsi', () => {
    (0, vitest_1.it)('カラーコードを除去する', () => {
        (0, vitest_1.expect)((0, cheatsh_1.stripAnsi)(`${ESC}[36mtar${ESC}[0m -xzf`)).toBe('tar -xzf');
    });
    (0, vitest_1.it)('プレーンテキストはそのまま', () => {
        (0, vitest_1.expect)((0, cheatsh_1.stripAnsi)('tar -xzf file.tar.gz')).toBe('tar -xzf file.tar.gz');
    });
});
(0, vitest_1.describe)('isUnknownTopic', () => {
    (0, vitest_1.it)('Unknown topic. で始まるレスポンスを検出する', () => {
        (0, vitest_1.expect)((0, cheatsh_1.isUnknownTopic)('Unknown topic.\n')).toBe(true);
        (0, vitest_1.expect)((0, cheatsh_1.isUnknownTopic)('Unknown topic. Do you mean one of these?\ntar\n')).toBe(true);
        (0, vitest_1.expect)((0, cheatsh_1.isUnknownTopic)(`${ESC}[31mUnknown topic.${ESC}[0m`)).toBe(true);
    });
    (0, vitest_1.it)('通常のチートシートは false', () => {
        (0, vitest_1.expect)((0, cheatsh_1.isUnknownTopic)('# tar\ntar -xzf file\n')).toBe(false);
    });
});
(0, vitest_1.describe)('toMarkdown', () => {
    const date = new Date('2026-07-25T12:00:00.000Z');
    (0, vitest_1.it)('見出しと出典付きのコードフェンスに包む', () => {
        (0, vitest_1.expect)((0, cheatsh_1.toMarkdown)('tar', 'tar -xzf file.tar.gz\n', date)).toBe([
            '# tar',
            '',
            '> Fetched from https://cheat.sh/tar on 2026-07-25',
            '',
            '```',
            'tar -xzf file.tar.gz',
            '```',
            '',
        ].join('\n'));
    });
    (0, vitest_1.it)('本文にバッククォート列があればフェンスを長くする', () => {
        const markdown = (0, cheatsh_1.toMarkdown)('md', 'use ``` for a fence', date);
        (0, vitest_1.expect)(markdown).toContain('````\nuse ``` for a fence\n````');
    });
    (0, vitest_1.it)('カラーコードを除去してから包む', () => {
        (0, vitest_1.expect)((0, cheatsh_1.toMarkdown)('tar', `${ESC}[36mtar${ESC}[0m`, date)).toContain('```\ntar\n```');
    });
});
(0, vitest_1.describe)('fetchCheatSheet', () => {
    (0, vitest_1.it)('本文を返す（末尾の余分な空白は落とす）', async () => {
        const content = await (0, cheatsh_1.fetchCheatSheet)('tar', {
            fetchImpl: fakeFetch('tar -xzf file.tar.gz\n\n\n'),
        });
        (0, vitest_1.expect)(content).toBe('tar -xzf file.tar.gz\n');
    });
    (0, vitest_1.it)('不正なトピックはリクエスト前にエラー', async () => {
        await (0, vitest_1.expect)((0, cheatsh_1.fetchCheatSheet)('git log')).rejects.toThrow('Invalid topic');
    });
    (0, vitest_1.it)('Unknown topic はエラー', async () => {
        await (0, vitest_1.expect)((0, cheatsh_1.fetchCheatSheet)('nosuchtopic', { fetchImpl: fakeFetch('Unknown topic.\n') })).rejects.toThrow('No cheatsheet found');
    });
    (0, vitest_1.it)('空レスポンスはエラー', async () => {
        await (0, vitest_1.expect)((0, cheatsh_1.fetchCheatSheet)('tar', { fetchImpl: fakeFetch('   \n') })).rejects.toThrow('empty content');
    });
    (0, vitest_1.it)('HTTPエラーはステータスを伝える', async () => {
        await (0, vitest_1.expect)((0, cheatsh_1.fetchCheatSheet)('tar', {
            fetchImpl: fakeFetch('', { ok: false, status: 503, statusText: 'Service Unavailable' }),
        })).rejects.toThrow('cheat.sh returned 503 Service Unavailable');
    });
    (0, vitest_1.it)('タイムアウトはわかりやすいエラーにする', async () => {
        const timeoutFetch = (async () => {
            const error = new Error('The operation was aborted');
            error.name = 'TimeoutError';
            throw error;
        });
        await (0, vitest_1.expect)((0, cheatsh_1.fetchCheatSheet)('tar', { fetchImpl: timeoutFetch, timeoutMs: 50 })).rejects.toThrow('cheat.sh did not respond within 50ms');
    });
    (0, vitest_1.it)('ネットワークエラーは原因を伝える', async () => {
        const failingFetch = (async () => {
            throw new Error('getaddrinfo ENOTFOUND cheat.sh');
        });
        await (0, vitest_1.expect)((0, cheatsh_1.fetchCheatSheet)('tar', { fetchImpl: failingFetch })).rejects.toThrow('Failed to reach cheat.sh: getaddrinfo ENOTFOUND');
    });
});
//# sourceMappingURL=cheatsh.test.js.map