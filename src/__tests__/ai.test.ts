import { describe, it, expect, vi, beforeEach } from 'vitest';

// SDKのクライアントだけモックし、エラークラス等は実物を残す
const { streamMock } = vi.hoisted(() => ({ streamMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', async () => {
  const actual = await vi.importActual<typeof import('@anthropic-ai/sdk')>('@anthropic-ai/sdk');
  class MockAnthropic {
    messages = { stream: streamMock };
  }
  return { ...actual, default: MockAnthropic };
});

import {
  AI_MODEL,
  generateCheatsheet,
  refineCheatsheet,
  stripOuterFence,
  formatAiError,
} from '../lib/ai';

// finalMessage が返すレスポンスを組み立てる
const mockResponse = (text: string, stopReason = 'end_turn') => ({
  finalMessage: async () => ({
    content: [{ type: 'text', text }],
    stop_reason: stopReason,
  }),
});

beforeEach(() => {
  streamMock.mockReset();
});

describe('generateCheatsheet', () => {
  it('生成されたMarkdownを返す', async () => {
    streamMock.mockReturnValue(mockResponse('# Git\n\n```bash\ngit status\n```'));
    const result = await generateCheatsheet('git basics');

    expect(result).toBe('# Git\n\n```bash\ngit status\n```');
  });

  it('正しいモデルとトピックでAPIを呼ぶ', async () => {
    streamMock.mockReturnValue(mockResponse('# X'));
    await generateCheatsheet('jq basics');

    const params = streamMock.mock.calls[0][0];
    expect(params.model).toBe(AI_MODEL);
    expect(params.thinking).toEqual({ type: 'adaptive' });
    expect(params.messages[0].content).toContain('jq basics');
  });

  it('全体がコードフェンスで包まれていたら剥がす', async () => {
    streamMock.mockReturnValue(
      mockResponse('```markdown\n# Tar\n\n```bash\ntar -xzvf a.tgz\n```\n```')
    );
    const result = await generateCheatsheet('tar');

    expect(result.startsWith('# Tar')).toBe(true);
    expect(result).toContain('```bash');
  });

  it('空のレスポンスはエラーを投げる', async () => {
    streamMock.mockReturnValue(mockResponse('   '));
    await expect(generateCheatsheet('x')).rejects.toThrow('empty response');
  });

  it('refusalはエラーを投げる', async () => {
    streamMock.mockReturnValue(mockResponse('', 'refusal'));
    await expect(generateCheatsheet('x')).rejects.toThrow('declined');
  });
});

describe('refineCheatsheet', () => {
  it('整形されたMarkdownを返す', async () => {
    streamMock.mockReturnValue(mockResponse('# Clean\n\n## Section'));
    const result = await refineCheatsheet('messy notes');

    expect(result).toBe('# Clean\n\n## Section');
    const params = streamMock.mock.calls[0][0];
    expect(params.messages[0].content).toBe('messy notes');
  });
});

describe('stripOuterFence', () => {
  it('markdownフェンスを剥がす', () => {
    expect(stripOuterFence('```markdown\n# A\n```')).toBe('# A');
    expect(stripOuterFence('```md\n# A\n```')).toBe('# A');
    expect(stripOuterFence('```\n# A\n```')).toBe('# A');
  });

  it('フェンスなしはそのまま返す', () => {
    expect(stripOuterFence('# A\n\ntext')).toBe('# A\n\ntext');
  });

  it('内側のコードブロックは保持する', () => {
    const wrapped = '```markdown\n# A\n\n```bash\nls\n```\n```';
    expect(stripOuterFence(wrapped)).toBe('# A\n\n```bash\nls\n```');
  });

  it('途中に現れるフェンスでは剥がさない', () => {
    const text = 'intro\n```bash\nls\n```';
    expect(stripOuterFence(text)).toBe(text);
  });
});

describe('formatAiError', () => {
  it('APIキー未設定のSDKエラーをわかりやすいメッセージにする', () => {
    const error = new Error(
      'Could not resolve authentication method. Expected either apiKey or authToken to be set.'
    );
    expect(formatAiError(error)).toContain('ANTHROPIC_API_KEY');
  });

  it('通常のエラーはメッセージをそのまま返す', () => {
    expect(formatAiError(new Error('boom'))).toBe('boom');
  });

  it('Error以外は文字列化する', () => {
    expect(formatAiError('oops')).toBe('oops');
  });
});
