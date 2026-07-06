import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// テスト用の一時ディレクトリ
let testDir: string;

// config.tsのモック
vi.mock('../lib/config', async () => {
  const actual = await vi.importActual('../lib/config');
  return {
    ...actual,
    get CONFIG_DIR() { return testDir; },
    get DATA_FILE() { return path.join(testDir, 'data.json'); },
    get SHEETS_DIR() { return path.join(testDir, 'sheets'); },
    get IMAGES_DIR() { return path.join(testDir, 'images'); },
  };
});

// モック後にインポート
const importMcpTools = async () => {
  vi.resetModules();
  return import('../lib/mcpTools');
};

describe('mcpTools', () => {
  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cs-mcp-test-'));
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('addCheatsheet', () => {
    it('新しいシートを追加する', async () => {
      const tools = await importMcpTools();
      const result = await tools.addCheatsheet({
        name: 'git-tips',
        content: '# Git\n\n```bash\ngit status\n```\n',
        tags: 'git,vcs',
      });

      expect(result.isError).toBeUndefined();
      expect(result.text).toContain('Added cheatsheet "git-tips"');
      expect(result.text).toContain('git, vcs');
      expect(await fs.pathExists(path.join(testDir, 'sheets', 'git-tips.md'))).toBe(true);
    });

    it('無効な名前はエラーを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.addCheatsheet({ name: 'bad name', content: 'x' });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('alphanumeric');
    });

    it('空のコンテンツはエラーを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.addCheatsheet({ name: 'empty', content: '   ' });

      expect(result.isError).toBe(true);
    });

    it('既存シートはoverwriteなしではエラーを返す', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'dup', content: 'v1' });
      const result = await tools.addCheatsheet({ name: 'dup', content: 'v2' });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('already exists');
    });

    it('overwrite指定で上書きし、タグを引き継ぐ', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'dup', content: 'v1', tags: 'shell' });
      const result = await tools.addCheatsheet({ name: 'dup', content: 'v2', overwrite: true });

      expect(result.isError).toBeUndefined();
      expect(result.text).toContain('Updated cheatsheet "dup"');
      expect(result.text).toContain('shell');

      const content = await fs.readFile(path.join(testDir, 'sheets', 'dup.md'), 'utf-8');
      expect(content).toBe('v2');
    });

    it('無効なタグはエラーを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.addCheatsheet({ name: 'x', content: 'y', tags: 'ng tag' });

      expect(result.isError).toBe(true);
      expect(result.text).toContain('Invalid tag');
    });
  });

  describe('getCheatsheet', () => {
    it('シートの内容を返す', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'tar-tips', content: '# Tar\n\ntar -xzvf' });
      const result = await tools.getCheatsheet('tar-tips');

      expect(result.isError).toBeUndefined();
      expect(result.text).toBe('# Tar\n\ntar -xzvf');
    });

    it('存在しないシートはエラーを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.getCheatsheet('nope');

      expect(result.isError).toBe(true);
      expect(result.text).toContain('not found');
    });
  });

  describe('listCheatsheets', () => {
    it('全シートを一覧する', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'a-sheet', content: 'a', tags: 'git' });
      await tools.addCheatsheet({ name: 'b-sheet', content: 'b' });
      const result = await tools.listCheatsheets();

      expect(result.text).toContain('2 cheatsheet(s)');
      expect(result.text).toContain('a-sheet');
      expect(result.text).toContain('[tags: git]');
      expect(result.text).toContain('b-sheet');
    });

    it('タグで絞り込む', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'a-sheet', content: 'a', tags: 'git' });
      await tools.addCheatsheet({ name: 'b-sheet', content: 'b', tags: 'docker' });
      const result = await tools.listCheatsheets('git');

      expect(result.text).toContain('a-sheet');
      expect(result.text).not.toContain('b-sheet');
    });

    it('シートがない場合はメッセージを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.listCheatsheets();

      expect(result.text).toContain('No cheatsheets found');
      expect(result.isError).toBeUndefined();
    });
  });

  describe('searchCheatsheets', () => {
    it('名前でマッチする', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'git-tips', content: 'commit stuff' });
      const result = await tools.searchCheatsheets('git');

      expect(result.text).toContain('git-tips');
      expect(result.text).toContain('matched by name');
    });

    it('内容でマッチする', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'git-tips', content: 'how to rebase' });
      const result = await tools.searchCheatsheets('rebase');

      expect(result.text).toContain('matched by content');
    });

    it('タグのみで検索できる', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'git-tips', content: 'x', tags: 'vcs' });
      const result = await tools.searchCheatsheets(undefined, 'vcs');

      expect(result.text).toContain('matched by tag');
    });

    it('キーワードとタグを組み合わせる', async () => {
      const tools = await importMcpTools();
      await tools.addCheatsheet({ name: 'git-tips', content: 'x', tags: 'vcs' });
      await tools.addCheatsheet({ name: 'svn-tips', content: 'x', tags: 'vcs' });
      const result = await tools.searchCheatsheets('git', 'vcs');

      expect(result.text).toContain('git-tips');
      expect(result.text).not.toContain('svn-tips');
    });

    it('条件なしはエラーを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.searchCheatsheets();

      expect(result.isError).toBe(true);
    });

    it('ヒットなしはエラーではなくメッセージを返す', async () => {
      const tools = await importMcpTools();
      const result = await tools.searchCheatsheets('nothing');

      expect(result.isError).toBeUndefined();
      expect(result.text).toContain('No matching cheatsheets');
    });
  });
});
