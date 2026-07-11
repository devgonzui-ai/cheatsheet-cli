"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// SDKのクライアントだけモックし、エラークラス等は実物を残す
const { streamMock } = vitest_1.vi.hoisted(() => ({ streamMock: vitest_1.vi.fn() }));
vitest_1.vi.mock('@anthropic-ai/sdk', async () => {
    const actual = await vitest_1.vi.importActual('@anthropic-ai/sdk');
    class MockAnthropic {
        constructor() {
            this.messages = { stream: streamMock };
        }
    }
    return { ...actual, default: MockAnthropic };
});
const ai_1 = require("../lib/ai");
// finalMessage が返すレスポンスを組み立てる
const mockResponse = (text, stopReason = 'end_turn') => ({
    finalMessage: async () => ({
        content: [{ type: 'text', text }],
        stop_reason: stopReason,
    }),
});
(0, vitest_1.beforeEach)(() => {
    streamMock.mockReset();
});
(0, vitest_1.describe)('generateCheatsheet', () => {
    (0, vitest_1.it)('生成されたMarkdownを返す', async () => {
        streamMock.mockReturnValue(mockResponse('# Git\n\n```bash\ngit status\n```'));
        const result = await (0, ai_1.generateCheatsheet)('git basics');
        (0, vitest_1.expect)(result).toBe('# Git\n\n```bash\ngit status\n```');
    });
    (0, vitest_1.it)('正しいモデルとトピックでAPIを呼ぶ', async () => {
        streamMock.mockReturnValue(mockResponse('# X'));
        await (0, ai_1.generateCheatsheet)('jq basics');
        const params = streamMock.mock.calls[0][0];
        (0, vitest_1.expect)(params.model).toBe(ai_1.AI_MODEL);
        (0, vitest_1.expect)(params.thinking).toEqual({ type: 'adaptive' });
        (0, vitest_1.expect)(params.messages[0].content).toContain('jq basics');
    });
    (0, vitest_1.it)('全体がコードフェンスで包まれていたら剥がす', async () => {
        streamMock.mockReturnValue(mockResponse('```markdown\n# Tar\n\n```bash\ntar -xzvf a.tgz\n```\n```'));
        const result = await (0, ai_1.generateCheatsheet)('tar');
        (0, vitest_1.expect)(result.startsWith('# Tar')).toBe(true);
        (0, vitest_1.expect)(result).toContain('```bash');
    });
    (0, vitest_1.it)('空のレスポンスはエラーを投げる', async () => {
        streamMock.mockReturnValue(mockResponse('   '));
        await (0, vitest_1.expect)((0, ai_1.generateCheatsheet)('x')).rejects.toThrow('empty response');
    });
    (0, vitest_1.it)('refusalはエラーを投げる', async () => {
        streamMock.mockReturnValue(mockResponse('', 'refusal'));
        await (0, vitest_1.expect)((0, ai_1.generateCheatsheet)('x')).rejects.toThrow('declined');
    });
});
(0, vitest_1.describe)('refineCheatsheet', () => {
    (0, vitest_1.it)('整形されたMarkdownを返す', async () => {
        streamMock.mockReturnValue(mockResponse('# Clean\n\n## Section'));
        const result = await (0, ai_1.refineCheatsheet)('messy notes');
        (0, vitest_1.expect)(result).toBe('# Clean\n\n## Section');
        const params = streamMock.mock.calls[0][0];
        (0, vitest_1.expect)(params.messages[0].content).toBe('messy notes');
    });
});
(0, vitest_1.describe)('stripOuterFence', () => {
    (0, vitest_1.it)('markdownフェンスを剥がす', () => {
        (0, vitest_1.expect)((0, ai_1.stripOuterFence)('```markdown\n# A\n```')).toBe('# A');
        (0, vitest_1.expect)((0, ai_1.stripOuterFence)('```md\n# A\n```')).toBe('# A');
        (0, vitest_1.expect)((0, ai_1.stripOuterFence)('```\n# A\n```')).toBe('# A');
    });
    (0, vitest_1.it)('フェンスなしはそのまま返す', () => {
        (0, vitest_1.expect)((0, ai_1.stripOuterFence)('# A\n\ntext')).toBe('# A\n\ntext');
    });
    (0, vitest_1.it)('内側のコードブロックは保持する', () => {
        const wrapped = '```markdown\n# A\n\n```bash\nls\n```\n```';
        (0, vitest_1.expect)((0, ai_1.stripOuterFence)(wrapped)).toBe('# A\n\n```bash\nls\n```');
    });
    (0, vitest_1.it)('途中に現れるフェンスでは剥がさない', () => {
        const text = 'intro\n```bash\nls\n```';
        (0, vitest_1.expect)((0, ai_1.stripOuterFence)(text)).toBe(text);
    });
});
(0, vitest_1.describe)('formatAiError', () => {
    (0, vitest_1.it)('APIキー未設定のSDKエラーをわかりやすいメッセージにする', () => {
        const error = new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set.');
        (0, vitest_1.expect)((0, ai_1.formatAiError)(error)).toContain('ANTHROPIC_API_KEY');
    });
    (0, vitest_1.it)('通常のエラーはメッセージをそのまま返す', () => {
        (0, vitest_1.expect)((0, ai_1.formatAiError)(new Error('boom'))).toBe('boom');
    });
    (0, vitest_1.it)('Error以外は文字列化する', () => {
        (0, vitest_1.expect)((0, ai_1.formatAiError)('oops')).toBe('oops');
    });
});
//# sourceMappingURL=ai.test.js.map