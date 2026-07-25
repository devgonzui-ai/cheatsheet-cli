import { describe, it, expect } from 'vitest';
import {
  validateTopic,
  topicToSheetName,
  buildUrl,
  stripAnsi,
  isUnknownTopic,
  toMarkdown,
  fetchCheatSheet,
} from '../lib/cheatsh';

const ESC = String.fromCharCode(27);

// fetch の代わりに使うスタブ
const fakeFetch = (
  body: string,
  init: { ok?: boolean; status?: number; statusText?: string } = {}
): typeof fetch => {
  const { ok = true, status = 200, statusText = 'OK' } = init;
  return (async () => ({
    ok,
    status,
    statusText,
    text: async () => body,
  })) as unknown as typeof fetch;
};

describe('validateTopic', () => {
  it('英数と - _ . + / を許可する', () => {
    expect(validateTopic('tar')).toBe(true);
    expect(validateTopic('python/lists')).toBe(true);
    expect(validateTopic('go/reverse+string')).toBe(true);
    expect(validateTopic('c++')).toBe(true);
  });

  it('空文字やスペース、クエリ文字は弾く', () => {
    expect(validateTopic('')).toBe(false);
    expect(validateTopic('git log')).toBe(false);
    expect(validateTopic('tar?T=1')).toBe(false);
    expect(validateTopic('tar#frag')).toBe(false);
  });

  it('親ディレクトリ参照は弾く', () => {
    expect(validateTopic('../etc/passwd')).toBe(false);
    expect(validateTopic('python/../..')).toBe(false);
  });
});

describe('topicToSheetName', () => {
  it('/ + . を - に畳む', () => {
    expect(topicToSheetName('tar')).toBe('tar');
    expect(topicToSheetName('python/lists')).toBe('python-lists');
    expect(topicToSheetName('go/reverse+string')).toBe('go-reverse-string');
    expect(topicToSheetName('c++')).toBe('c');
  });

  it('連続する区切りと前後の - を落とす', () => {
    expect(topicToSheetName('a//b')).toBe('a-b');
    expect(topicToSheetName('.hidden.')).toBe('hidden');
  });
});

describe('buildUrl', () => {
  it('プレーンテキストを要求する ?T を付ける', () => {
    expect(buildUrl('tar')).toBe('https://cheat.sh/tar?T');
    expect(buildUrl('python/lists')).toBe('https://cheat.sh/python/lists?T');
  });
});

describe('stripAnsi', () => {
  it('カラーコードを除去する', () => {
    expect(stripAnsi(`${ESC}[36mtar${ESC}[0m -xzf`)).toBe('tar -xzf');
  });

  it('プレーンテキストはそのまま', () => {
    expect(stripAnsi('tar -xzf file.tar.gz')).toBe('tar -xzf file.tar.gz');
  });
});

describe('isUnknownTopic', () => {
  it('Unknown topic. で始まるレスポンスを検出する', () => {
    expect(isUnknownTopic('Unknown topic.\n')).toBe(true);
    expect(isUnknownTopic('Unknown topic. Do you mean one of these?\ntar\n')).toBe(true);
    expect(isUnknownTopic(`${ESC}[31mUnknown topic.${ESC}[0m`)).toBe(true);
  });

  it('通常のチートシートは false', () => {
    expect(isUnknownTopic('# tar\ntar -xzf file\n')).toBe(false);
  });
});

describe('toMarkdown', () => {
  const date = new Date('2026-07-25T12:00:00.000Z');

  it('見出しと出典付きのコードフェンスに包む', () => {
    expect(toMarkdown('tar', 'tar -xzf file.tar.gz\n', date)).toBe(
      [
        '# tar',
        '',
        '> Fetched from https://cheat.sh/tar on 2026-07-25',
        '',
        '```',
        'tar -xzf file.tar.gz',
        '```',
        '',
      ].join('\n')
    );
  });

  it('本文にバッククォート列があればフェンスを長くする', () => {
    const markdown = toMarkdown('md', 'use ``` for a fence', date);
    expect(markdown).toContain('````\nuse ``` for a fence\n````');
  });

  it('カラーコードを除去してから包む', () => {
    expect(toMarkdown('tar', `${ESC}[36mtar${ESC}[0m`, date)).toContain('```\ntar\n```');
  });
});

describe('fetchCheatSheet', () => {
  it('本文を返す（末尾の余分な空白は落とす）', async () => {
    const content = await fetchCheatSheet('tar', {
      fetchImpl: fakeFetch('tar -xzf file.tar.gz\n\n\n'),
    });
    expect(content).toBe('tar -xzf file.tar.gz\n');
  });

  it('不正なトピックはリクエスト前にエラー', async () => {
    await expect(fetchCheatSheet('git log')).rejects.toThrow('Invalid topic');
  });

  it('Unknown topic はエラー', async () => {
    await expect(
      fetchCheatSheet('nosuchtopic', { fetchImpl: fakeFetch('Unknown topic.\n') })
    ).rejects.toThrow('No cheatsheet found');
  });

  it('空レスポンスはエラー', async () => {
    await expect(fetchCheatSheet('tar', { fetchImpl: fakeFetch('   \n') })).rejects.toThrow(
      'empty content'
    );
  });

  it('HTTPエラーはステータスを伝える', async () => {
    await expect(
      fetchCheatSheet('tar', {
        fetchImpl: fakeFetch('', { ok: false, status: 503, statusText: 'Service Unavailable' }),
      })
    ).rejects.toThrow('cheat.sh returned 503 Service Unavailable');
  });

  it('タイムアウトはわかりやすいエラーにする', async () => {
    const timeoutFetch = (async () => {
      const error = new Error('The operation was aborted');
      error.name = 'TimeoutError';
      throw error;
    }) as unknown as typeof fetch;

    await expect(
      fetchCheatSheet('tar', { fetchImpl: timeoutFetch, timeoutMs: 50 })
    ).rejects.toThrow('cheat.sh did not respond within 50ms');
  });

  it('ネットワークエラーは原因を伝える', async () => {
    const failingFetch = (async () => {
      throw new Error('getaddrinfo ENOTFOUND cheat.sh');
    }) as unknown as typeof fetch;

    await expect(fetchCheatSheet('tar', { fetchImpl: failingFetch })).rejects.toThrow(
      'Failed to reach cheat.sh: getaddrinfo ENOTFOUND'
    );
  });
});
