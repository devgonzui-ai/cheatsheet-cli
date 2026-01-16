import { describe, it, expect } from 'vitest';
import { Sheet } from '../types';
import {
  matchByName,
  matchByContent,
  createSearchResult,
  searchSheetsByName,
} from '../lib/search';

const createTestSheet = (name: string, type: 'text' | 'image' = 'text'): Sheet => ({
  name,
  type,
  filename: `${name}.${type === 'text' ? 'md' : 'png'}`,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
});

describe('matchByName', () => {
  it('名前に完全一致する場合trueを返す', () => {
    const sheet = createTestSheet('git-commands');
    expect(matchByName(sheet, 'git-commands')).toBe(true);
  });

  it('名前に部分一致する場合trueを返す', () => {
    const sheet = createTestSheet('git-commands');
    expect(matchByName(sheet, 'git')).toBe(true);
    expect(matchByName(sheet, 'commands')).toBe(true);
  });

  it('大文字小文字を区別しない', () => {
    const sheet = createTestSheet('Git-Commands');
    expect(matchByName(sheet, 'git')).toBe(true);
    expect(matchByName(sheet, 'GIT')).toBe(true);
    expect(matchByName(sheet, 'Git')).toBe(true);
  });

  it('一致しない場合falseを返す', () => {
    const sheet = createTestSheet('git-commands');
    expect(matchByName(sheet, 'docker')).toBe(false);
    expect(matchByName(sheet, 'vim')).toBe(false);
  });

  it('空文字は全てにマッチする', () => {
    const sheet = createTestSheet('git-commands');
    expect(matchByName(sheet, '')).toBe(true);
  });
});

describe('matchByContent', () => {
  it('コンテンツに完全一致する場合trueを返す', () => {
    const content = 'git commit -m "message"';
    expect(matchByContent(content, 'git commit')).toBe(true);
  });

  it('コンテンツに部分一致する場合trueを返す', () => {
    const content = 'Use git to manage your code';
    expect(matchByContent(content, 'git')).toBe(true);
    expect(matchByContent(content, 'code')).toBe(true);
  });

  it('大文字小文字を区別しない', () => {
    const content = 'Git is a version control system';
    expect(matchByContent(content, 'git')).toBe(true);
    expect(matchByContent(content, 'GIT')).toBe(true);
    expect(matchByContent(content, 'Version')).toBe(true);
  });

  it('一致しない場合falseを返す', () => {
    const content = 'git commit -m "message"';
    expect(matchByContent(content, 'docker')).toBe(false);
  });

  it('複数行のコンテンツを検索できる', () => {
    const content = `# Git Commands

## Commit
git commit -m "message"

## Push
git push origin main`;
    expect(matchByContent(content, 'commit')).toBe(true);
    expect(matchByContent(content, 'push')).toBe(true);
    expect(matchByContent(content, 'origin')).toBe(true);
  });
});

describe('createSearchResult', () => {
  it('名前マッチの結果を生成する', () => {
    const sheet = createTestSheet('git-commands');
    const result = createSearchResult(sheet, 'name');

    expect(result).toEqual({
      name: 'git-commands',
      type: 'text',
      matchType: 'name',
    });
  });

  it('コンテンツマッチの結果を生成する', () => {
    const sheet = createTestSheet('git-commands');
    const result = createSearchResult(sheet, 'content');

    expect(result).toEqual({
      name: 'git-commands',
      type: 'text',
      matchType: 'content',
    });
  });

  it('画像タイプのシートの結果を生成する', () => {
    const sheet = createTestSheet('vim-cheatsheet', 'image');
    const result = createSearchResult(sheet, 'name');

    expect(result).toEqual({
      name: 'vim-cheatsheet',
      type: 'image',
      matchType: 'name',
    });
  });
});

describe('searchSheetsByName', () => {
  const sheets: Sheet[] = [
    createTestSheet('git-commands'),
    createTestSheet('git-rebase'),
    createTestSheet('docker-compose'),
    createTestSheet('vim-basics'),
  ];

  it('名前でシートを検索する', () => {
    const results = searchSheetsByName(sheets, 'git');

    expect(results).toHaveLength(2);
    expect(results.map(r => r.name)).toContain('git-commands');
    expect(results.map(r => r.name)).toContain('git-rebase');
  });

  it('一致するシートがない場合空配列を返す', () => {
    const results = searchSheetsByName(sheets, 'kubernetes');

    expect(results).toHaveLength(0);
  });

  it('単一の結果を返す', () => {
    const results = searchSheetsByName(sheets, 'docker');

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('docker-compose');
  });

  it('全てのシートを返す（空文字検索）', () => {
    const results = searchSheetsByName(sheets, '');

    expect(results).toHaveLength(4);
  });

  it('結果のmatchTypeはnameになる', () => {
    const results = searchSheetsByName(sheets, 'vim');

    expect(results).toHaveLength(1);
    expect(results[0].matchType).toBe('name');
  });
});
