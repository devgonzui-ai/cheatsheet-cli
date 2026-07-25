import { describe, it, expect } from 'vitest';
import { extractCodeBlocks } from '../lib/markdown';

describe('extractCodeBlocks', () => {
  it('単一のコードブロックを抽出する', () => {
    const content = `# Git

\`\`\`bash
git commit -m "message"
\`\`\`
`;
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({ lang: 'bash', code: 'git commit -m "message"' });
  });

  it('複数のコードブロックを抽出する', () => {
    const content = `# Docker

\`\`\`bash
docker ps
\`\`\`

テキスト

\`\`\`yaml
version: "3"
services:
  app:
    image: node
\`\`\`
`;
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].lang).toBe('bash');
    expect(blocks[0].code).toBe('docker ps');
    expect(blocks[1].lang).toBe('yaml');
    expect(blocks[1].code).toContain('services:');
  });

  it('言語指定がないコードブロックを抽出する', () => {
    const content = '```\nplain code\n```';
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({ lang: '', code: 'plain code' });
  });

  it('複数行のコードを保持する', () => {
    const content = '```bash\ngit add .\ngit commit\ngit push\n```';
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe('git add .\ngit commit\ngit push');
  });

  it('コードブロックがない場合は空配列を返す', () => {
    const content = '# Title\n\nJust text with `inline code`.';
    expect(extractCodeBlocks(content)).toEqual([]);
  });

  it('空のコードブロックは除外する', () => {
    const content = '```bash\n\n```\n\n```bash\ngit status\n```';
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].code).toBe('git status');
  });

  it('閉じられていないコードブロックは無視する', () => {
    const content = '```bash\ngit status';
    expect(extractCodeBlocks(content)).toEqual([]);
  });

  // ``` を含む内容は4連以上のフェンスで包むのが正しい書き方
  it('長いフェンスの中の ``` は本文として扱う', () => {
    const content = '````\nsee ```python\nflat = []\n```\n````';
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].lang).toBe('');
    expect(blocks[0].code).toBe('see ```python\nflat = []\n```');
  });

  it('長いフェンスの後ろのブロックも番号がズレない', () => {
    const content = '````md\nnested:\n```bash\ngit status\n```\n````\n\n```bash\necho hello\n```';
    const blocks = extractCodeBlocks(content);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].lang).toBe('md');
    expect(blocks[1].code).toBe('echo hello');
  });
});
