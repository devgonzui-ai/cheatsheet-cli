import { describe, it, expect } from 'vitest';
import { Sheet } from '../types';
import { parseTags, validateTags, matchByTag, formatTags } from '../lib/tags';

const createTestSheet = (name: string, tags?: string[]): Sheet => ({
  name,
  type: 'text',
  filename: `${name}.md`,
  tags,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
});

describe('parseTags', () => {
  it('カンマ区切りの文字列をパースする', () => {
    expect(parseTags('git,vcs')).toEqual(['git', 'vcs']);
  });

  it('前後の空白をトリムする', () => {
    expect(parseTags(' git , vcs ')).toEqual(['git', 'vcs']);
  });

  it('空要素を除去する', () => {
    expect(parseTags('git,,vcs,')).toEqual(['git', 'vcs']);
  });

  it('重複を排除する', () => {
    expect(parseTags('git,git,vcs')).toEqual(['git', 'vcs']);
  });

  it('大文字は小文字に正規化する', () => {
    expect(parseTags('Git,VCS')).toEqual(['git', 'vcs']);
  });

  it('単一タグをパースする', () => {
    expect(parseTags('docker')).toEqual(['docker']);
  });

  it('空文字は空配列を返す', () => {
    expect(parseTags('')).toEqual([]);
  });
});

describe('validateTags', () => {
  it('有効なタグは空配列を返す', () => {
    expect(validateTags(['git', 'my-tag', 'tag_2'])).toEqual([]);
  });

  it('無効なタグを返す', () => {
    expect(validateTags(['git', 'ng tag', 'ng/tag'])).toEqual(['ng tag', 'ng/tag']);
  });
});

describe('matchByTag', () => {
  it('タグが一致する場合trueを返す', () => {
    const sheet = createTestSheet('git-commands', ['git', 'vcs']);
    expect(matchByTag(sheet, 'git')).toBe(true);
    expect(matchByTag(sheet, 'vcs')).toBe(true);
  });

  it('大文字小文字を区別しない', () => {
    const sheet = createTestSheet('git-commands', ['git']);
    expect(matchByTag(sheet, 'GIT')).toBe(true);
    expect(matchByTag(sheet, 'Git')).toBe(true);
  });

  it('タグが一致しない場合falseを返す', () => {
    const sheet = createTestSheet('git-commands', ['git']);
    expect(matchByTag(sheet, 'docker')).toBe(false);
  });

  it('部分一致ではマッチしない', () => {
    const sheet = createTestSheet('git-commands', ['github']);
    expect(matchByTag(sheet, 'git')).toBe(false);
  });

  it('タグがないシートはfalseを返す', () => {
    expect(matchByTag(createTestSheet('no-tags'), 'git')).toBe(false);
    expect(matchByTag(createTestSheet('empty-tags', []), 'git')).toBe(false);
  });
});

describe('formatTags', () => {
  it('タグをカンマ区切りで表示する', () => {
    expect(formatTags(['git', 'vcs'])).toBe('git, vcs');
  });

  it('タグがない場合はハイフンを返す', () => {
    expect(formatTags(undefined)).toBe('-');
    expect(formatTags([])).toBe('-');
  });
});
