import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { loadConfig, saveConfig, expandHome } from '../lib/config';
import {
  getCompletionScript,
  COMPLETION_COMMANDS,
  SHEET_NAME_COMMANDS,
} from '../lib/completion';

describe('config load/save', () => {
  let testDir: string;
  let configFile: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cs-config-test-'));
    configFile = path.join(testDir, 'config.json');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('保存して読み込める', () => {
    saveConfig({ editor: 'code', dir: '/tmp/sheets' }, configFile);
    expect(loadConfig(configFile)).toEqual({ editor: 'code', dir: '/tmp/sheets' });
  });

  it('存在しないファイルは空設定を返す', () => {
    expect(loadConfig(path.join(testDir, 'nope.json'))).toEqual({});
  });

  it('壊れたJSONは空設定を返す', async () => {
    await fs.writeFile(configFile, '{oops', 'utf-8');
    expect(loadConfig(configFile)).toEqual({});
  });

  it('未知のキーや不正な型は無視する', async () => {
    await fs.writeJson(configFile, { editor: 123, dir: '/x', extra: true });
    expect(loadConfig(configFile)).toEqual({ dir: '/x' });
  });

  it('親ディレクトリがなくても保存できる', () => {
    const nested = path.join(testDir, 'a', 'b', 'config.json');
    saveConfig({ editor: 'nano' }, nested);
    expect(loadConfig(nested)).toEqual({ editor: 'nano' });
  });
});

describe('expandHome', () => {
  it('~/ をホームに展開する', () => {
    expect(expandHome('~/sheets')).toBe(path.join(os.homedir(), 'sheets'));
  });

  it('~ 単体もホームに展開する', () => {
    expect(expandHome('~')).toBe(os.homedir());
  });

  it('通常のパスはそのまま', () => {
    expect(expandHome('/absolute/path')).toBe('/absolute/path');
    expect(expandHome('relative/path')).toBe('relative/path');
  });
});

describe('getCompletionScript', () => {
  it('zshスクリプトに全コマンドが含まれる', () => {
    const script = getCompletionScript('zsh');
    expect(script).toBeDefined();
    for (const command of COMPLETION_COMMANDS) {
      expect(script).toContain(command);
    }
    expect(script).toContain('compdef');
    expect(script).toContain('cs _names');
  });

  it('bashスクリプトに全コマンドとcompleteが含まれる', () => {
    const script = getCompletionScript('bash');
    expect(script).toBeDefined();
    expect(script).toContain('complete -F');
    expect(script).toContain('cs _names');
    for (const command of SHEET_NAME_COMMANDS) {
      expect(script).toContain(command);
    }
  });

  it('未対応シェルはundefined', () => {
    expect(getCompletionScript('fish')).toBeUndefined();
    expect(getCompletionScript('')).toBeUndefined();
  });
});
