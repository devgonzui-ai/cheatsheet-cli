"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const markdown_1 = require("../lib/markdown");
// ANSIエスケープコードを除去するヘルパー
const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');
(0, vitest_1.describe)('getDisplayWidth', () => {
    (0, vitest_1.it)('ASCII文字の幅を正しく計算する', () => {
        (0, vitest_1.expect)((0, markdown_1.getDisplayWidth)('hello')).toBe(5);
    });
    (0, vitest_1.it)('日本語文字の幅を正しく計算する', () => {
        (0, vitest_1.expect)((0, markdown_1.getDisplayWidth)('こんにちは')).toBe(10); // 全角5文字 = 幅10
    });
    (0, vitest_1.it)('混合文字列の幅を正しく計算する', () => {
        (0, vitest_1.expect)((0, markdown_1.getDisplayWidth)('hello世界')).toBe(9); // 5 + 4
    });
    (0, vitest_1.it)('ANSIエスケープコードを無視する', () => {
        (0, vitest_1.expect)((0, markdown_1.getDisplayWidth)('\x1b[31mhello\x1b[0m')).toBe(5);
    });
});
(0, vitest_1.describe)('processInline', () => {
    (0, vitest_1.it)('インラインコードを処理する', () => {
        const result = (0, markdown_1.processInline)('Use `git commit` command');
        (0, vitest_1.expect)(stripAnsi(result)).toContain('git commit');
    });
    (0, vitest_1.it)('太字を処理する', () => {
        const result = (0, markdown_1.processInline)('This is **important**');
        (0, vitest_1.expect)(stripAnsi(result)).toContain('important');
    });
    (0, vitest_1.it)('斜体を処理する', () => {
        const result = (0, markdown_1.processInline)('This is *emphasized*');
        (0, vitest_1.expect)(stripAnsi(result)).toContain('emphasized');
    });
    (0, vitest_1.it)('複数のインライン要素を処理する', () => {
        const result = (0, markdown_1.processInline)('Use `code` and **bold** and *italic*');
        const stripped = stripAnsi(result);
        (0, vitest_1.expect)(stripped).toContain('code');
        (0, vitest_1.expect)(stripped).toContain('bold');
        (0, vitest_1.expect)(stripped).toContain('italic');
    });
    (0, vitest_1.it)('インライン要素がない場合はそのまま返す', () => {
        const result = (0, markdown_1.processInline)('plain text');
        (0, vitest_1.expect)(stripAnsi(result)).toBe('plain text');
    });
});
(0, vitest_1.describe)('renderMarkdown', () => {
    (0, vitest_1.describe)('見出し', () => {
        (0, vitest_1.it)('h1見出しをレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('# Title');
            (0, vitest_1.expect)(stripAnsi(result)).toContain('Title');
        });
        (0, vitest_1.it)('h2見出しをレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('## Section');
            (0, vitest_1.expect)(stripAnsi(result)).toContain('Section');
        });
        (0, vitest_1.it)('h3見出しをレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('### Subsection');
            (0, vitest_1.expect)(stripAnsi(result)).toContain('Subsection');
        });
    });
    (0, vitest_1.describe)('リスト', () => {
        (0, vitest_1.it)('ハイフンリストをレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('- item 1\n- item 2');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('•');
            (0, vitest_1.expect)(stripped).toContain('item 1');
            (0, vitest_1.expect)(stripped).toContain('item 2');
        });
        (0, vitest_1.it)('アスタリスクリストをレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('* item 1\n* item 2');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('•');
        });
    });
    (0, vitest_1.describe)('コードブロック', () => {
        (0, vitest_1.it)('コードブロックをボックスで囲む', () => {
            const result = (0, markdown_1.renderMarkdown)('```bash\necho hello\n```');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('bash');
            (0, vitest_1.expect)(stripped).toContain('echo hello');
            (0, vitest_1.expect)(stripped).toContain('┌');
            (0, vitest_1.expect)(stripped).toContain('└');
            (0, vitest_1.expect)(stripped).toContain('│');
        });
        (0, vitest_1.it)('言語指定なしのコードブロックを処理する', () => {
            const result = (0, markdown_1.renderMarkdown)('```\nsome code\n```');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('some code');
            (0, vitest_1.expect)(stripped).toContain('┌');
        });
        (0, vitest_1.it)('複数行のコードブロックを処理する', () => {
            const result = (0, markdown_1.renderMarkdown)('```js\nconst a = 1;\nconst b = 2;\n```');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('const a = 1;');
            (0, vitest_1.expect)(stripped).toContain('const b = 2;');
        });
    });
    (0, vitest_1.describe)('テーブル', () => {
        (0, vitest_1.it)('テーブルをレンダリングする', () => {
            const markdown = `| Header1 | Header2 |
|---------|---------|
| Cell1   | Cell2   |`;
            const result = (0, markdown_1.renderMarkdown)(markdown);
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('Header1');
            (0, vitest_1.expect)(stripped).toContain('Header2');
            (0, vitest_1.expect)(stripped).toContain('Cell1');
            (0, vitest_1.expect)(stripped).toContain('Cell2');
        });
        (0, vitest_1.it)('複数行のテーブルをレンダリングする', () => {
            const markdown = `| A | B |
|---|---|
| 1 | 2 |
| 3 | 4 |`;
            const result = (0, markdown_1.renderMarkdown)(markdown);
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('1');
            (0, vitest_1.expect)(stripped).toContain('2');
            (0, vitest_1.expect)(stripped).toContain('3');
            (0, vitest_1.expect)(stripped).toContain('4');
        });
    });
    (0, vitest_1.describe)('水平線', () => {
        (0, vitest_1.it)('ハイフン水平線をレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('---');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('─');
        });
        (0, vitest_1.it)('アスタリスク水平線をレンダリングする', () => {
            const result = (0, markdown_1.renderMarkdown)('***');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('─');
        });
    });
    (0, vitest_1.describe)('複合ドキュメント', () => {
        (0, vitest_1.it)('複数の要素を含むドキュメントをレンダリングする', () => {
            const markdown = `# Title

## Section

Some text with **bold** and \`code\`.

- item 1
- item 2

\`\`\`bash
echo test
\`\`\`
`;
            const result = (0, markdown_1.renderMarkdown)(markdown);
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('Title');
            (0, vitest_1.expect)(stripped).toContain('Section');
            (0, vitest_1.expect)(stripped).toContain('bold');
            (0, vitest_1.expect)(stripped).toContain('code');
            (0, vitest_1.expect)(stripped).toContain('•');
            (0, vitest_1.expect)(stripped).toContain('echo test');
        });
    });
    (0, vitest_1.describe)('通常テキスト', () => {
        (0, vitest_1.it)('通常のテキストをそのまま出力する', () => {
            const result = (0, markdown_1.renderMarkdown)('This is normal text.');
            (0, vitest_1.expect)(stripAnsi(result)).toBe('This is normal text.');
        });
        (0, vitest_1.it)('空行を保持する', () => {
            const result = (0, markdown_1.renderMarkdown)('line1\n\nline2');
            const stripped = stripAnsi(result);
            (0, vitest_1.expect)(stripped).toContain('line1');
            (0, vitest_1.expect)(stripped).toContain('line2');
        });
    });
});
//# sourceMappingURL=markdown.test.js.map