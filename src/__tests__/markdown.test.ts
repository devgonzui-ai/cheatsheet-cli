import { describe, it, expect } from 'vitest';
import { renderMarkdown, processInline, getDisplayWidth } from '../lib/markdown';

// ANSIエスケープコードを除去するヘルパー
const stripAnsi = (str: string): string => str.replace(/\x1b\[[0-9;]*m/g, '');

describe('getDisplayWidth', () => {
  it('ASCII文字の幅を正しく計算する', () => {
    expect(getDisplayWidth('hello')).toBe(5);
  });

  it('日本語文字の幅を正しく計算する', () => {
    expect(getDisplayWidth('こんにちは')).toBe(10); // 全角5文字 = 幅10
  });

  it('混合文字列の幅を正しく計算する', () => {
    expect(getDisplayWidth('hello世界')).toBe(9); // 5 + 4
  });

  it('ANSIエスケープコードを無視する', () => {
    expect(getDisplayWidth('\x1b[31mhello\x1b[0m')).toBe(5);
  });
});

describe('processInline', () => {
  it('インラインコードを処理する', () => {
    const result = processInline('Use `git commit` command');
    expect(stripAnsi(result)).toContain('git commit');
  });

  it('太字を処理する', () => {
    const result = processInline('This is **important**');
    expect(stripAnsi(result)).toContain('important');
  });

  it('斜体を処理する', () => {
    const result = processInline('This is *emphasized*');
    expect(stripAnsi(result)).toContain('emphasized');
  });

  it('複数のインライン要素を処理する', () => {
    const result = processInline('Use `code` and **bold** and *italic*');
    const stripped = stripAnsi(result);
    expect(stripped).toContain('code');
    expect(stripped).toContain('bold');
    expect(stripped).toContain('italic');
  });

  it('インライン要素がない場合はそのまま返す', () => {
    const result = processInline('plain text');
    expect(stripAnsi(result)).toBe('plain text');
  });
});

describe('renderMarkdown', () => {
  describe('見出し', () => {
    it('h1見出しをレンダリングする', () => {
      const result = renderMarkdown('# Title');
      expect(stripAnsi(result)).toContain('Title');
    });

    it('h2見出しをレンダリングする', () => {
      const result = renderMarkdown('## Section');
      expect(stripAnsi(result)).toContain('Section');
    });

    it('h3見出しをレンダリングする', () => {
      const result = renderMarkdown('### Subsection');
      expect(stripAnsi(result)).toContain('Subsection');
    });
  });

  describe('リスト', () => {
    it('ハイフンリストをレンダリングする', () => {
      const result = renderMarkdown('- item 1\n- item 2');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('•');
      expect(stripped).toContain('item 1');
      expect(stripped).toContain('item 2');
    });

    it('アスタリスクリストをレンダリングする', () => {
      const result = renderMarkdown('* item 1\n* item 2');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('•');
    });
  });

  describe('コードブロック', () => {
    it('コードブロックをボックスで囲む', () => {
      const result = renderMarkdown('```bash\necho hello\n```');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('bash');
      expect(stripped).toContain('echo hello');
      expect(stripped).toContain('┌');
      expect(stripped).toContain('└');
      expect(stripped).toContain('│');
    });

    it('言語指定なしのコードブロックを処理する', () => {
      const result = renderMarkdown('```\nsome code\n```');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('some code');
      expect(stripped).toContain('┌');
    });

    it('複数行のコードブロックを処理する', () => {
      const result = renderMarkdown('```js\nconst a = 1;\nconst b = 2;\n```');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('const a = 1;');
      expect(stripped).toContain('const b = 2;');
    });
  });

  describe('テーブル', () => {
    it('テーブルをレンダリングする', () => {
      const markdown = `| Header1 | Header2 |
|---------|---------|
| Cell1   | Cell2   |`;
      const result = renderMarkdown(markdown);
      const stripped = stripAnsi(result);
      expect(stripped).toContain('Header1');
      expect(stripped).toContain('Header2');
      expect(stripped).toContain('Cell1');
      expect(stripped).toContain('Cell2');
    });

    it('複数行のテーブルをレンダリングする', () => {
      const markdown = `| A | B |
|---|---|
| 1 | 2 |
| 3 | 4 |`;
      const result = renderMarkdown(markdown);
      const stripped = stripAnsi(result);
      expect(stripped).toContain('1');
      expect(stripped).toContain('2');
      expect(stripped).toContain('3');
      expect(stripped).toContain('4');
    });
  });

  describe('水平線', () => {
    it('ハイフン水平線をレンダリングする', () => {
      const result = renderMarkdown('---');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('─');
    });

    it('アスタリスク水平線をレンダリングする', () => {
      const result = renderMarkdown('***');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('─');
    });
  });

  describe('複合ドキュメント', () => {
    it('複数の要素を含むドキュメントをレンダリングする', () => {
      const markdown = `# Title

## Section

Some text with **bold** and \`code\`.

- item 1
- item 2

\`\`\`bash
echo test
\`\`\`
`;
      const result = renderMarkdown(markdown);
      const stripped = stripAnsi(result);

      expect(stripped).toContain('Title');
      expect(stripped).toContain('Section');
      expect(stripped).toContain('bold');
      expect(stripped).toContain('code');
      expect(stripped).toContain('•');
      expect(stripped).toContain('echo test');
    });
  });

  describe('通常テキスト', () => {
    it('通常のテキストをそのまま出力する', () => {
      const result = renderMarkdown('This is normal text.');
      expect(stripAnsi(result)).toBe('This is normal text.');
    });

    it('空行を保持する', () => {
      const result = renderMarkdown('line1\n\nline2');
      const stripped = stripAnsi(result);
      expect(stripped).toContain('line1');
      expect(stripped).toContain('line2');
    });
  });
});
