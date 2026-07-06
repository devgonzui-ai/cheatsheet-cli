import { describe, it, expect } from 'vitest';
import { fuzzyMatch, findMatchingLines, highlightKeyword } from '../lib/search';
import { filterSheets } from '../commands/interactive';
import { Sheet } from '../types';

const makeSheet = (name: string): Sheet => ({
  name,
  type: 'text',
  filename: `${name}.md`,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('fuzzyMatch', () => {
  it('文字が順番どおりに現れればマッチする', () => {
    expect(fuzzyMatch('git-commands', 'gitcmd')).toBe(true);
    expect(fuzzyMatch('docker-tips', 'dktp')).toBe(true);
  });

  it('大文字小文字を無視する', () => {
    expect(fuzzyMatch('Git-Commands', 'GITCMD')).toBe(true);
  });

  it('順番が違えばマッチしない', () => {
    expect(fuzzyMatch('git-commands', 'cmdgit')).toBe(false);
  });

  it('存在しない文字はマッチしない', () => {
    expect(fuzzyMatch('git', 'gitz')).toBe(false);
  });

  it('空キーワードは常にマッチ', () => {
    expect(fuzzyMatch('anything', '')).toBe(true);
  });
});

describe('findMatchingLines', () => {
  const content = '# Git\n\ngit status\ngit commit -m "msg"\nGIT COMMIT amend\ngit push';

  it('マッチする行を行番号付きで返す', () => {
    const result = findMatchingLines(content, 'commit');
    expect(result).toEqual([
      { lineNumber: 4, line: 'git commit -m "msg"' },
      { lineNumber: 5, line: 'GIT COMMIT amend' },
    ]);
  });

  it('limitで件数を制限する', () => {
    const result = findMatchingLines(content, 'git', 2);
    expect(result).toHaveLength(2);
    expect(result[0].lineNumber).toBe(1);
  });

  it('マッチなしは空配列', () => {
    expect(findMatchingLines(content, 'docker')).toEqual([]);
  });

  it('行の前後空白はトリムされる', () => {
    const result = findMatchingLines('   indented match   ', 'match');
    expect(result[0].line).toBe('indented match');
  });
});

describe('highlightKeyword', () => {
  const wrap = (s: string) => `<${s}>`;

  it('キーワードを装飾する', () => {
    expect(highlightKeyword('git commit now', 'commit', wrap)).toBe('git <commit> now');
  });

  it('大文字小文字を無視しつつ元の表記を保持する', () => {
    expect(highlightKeyword('Git COMMIT now', 'commit', wrap)).toBe('Git <COMMIT> now');
  });

  it('複数出現をすべて装飾する', () => {
    expect(highlightKeyword('aXbXc', 'x', wrap)).toBe('a<X>b<X>c');
  });

  it('マッチなしはそのまま返す', () => {
    expect(highlightKeyword('hello', 'zzz', wrap)).toBe('hello');
  });

  it('空キーワードはそのまま返す', () => {
    expect(highlightKeyword('hello', '', wrap)).toBe('hello');
  });
});

describe('filterSheets', () => {
  const sheets = [makeSheet('git-commands'), makeSheet('docker-tips'), makeSheet('tmux')];

  it('空入力は全件返す', () => {
    expect(filterSheets(sheets, '')).toHaveLength(3);
  });

  it('部分一致でフィルタする', () => {
    const result = filterSheets(sheets, 'docker');
    expect(result.map((s) => s.name)).toEqual(['docker-tips']);
  });

  it('fuzzyでもフィルタでき、部分一致が先に並ぶ', () => {
    const result = filterSheets([makeSheet('git-commands'), makeSheet('gcm-tool')], 'gcm');
    expect(result.map((s) => s.name)).toEqual(['gcm-tool', 'git-commands']);
  });

  it('どちらにもマッチしなければ空', () => {
    expect(filterSheets(sheets, 'zzz')).toEqual([]);
  });
});
