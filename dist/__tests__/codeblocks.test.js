"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const markdown_1 = require("../lib/markdown");
(0, vitest_1.describe)('extractCodeBlocks', () => {
    (0, vitest_1.it)('単一のコードブロックを抽出する', () => {
        const content = `# Git

\`\`\`bash
git commit -m "message"
\`\`\`
`;
        const blocks = (0, markdown_1.extractCodeBlocks)(content);
        (0, vitest_1.expect)(blocks).toHaveLength(1);
        (0, vitest_1.expect)(blocks[0]).toEqual({ lang: 'bash', code: 'git commit -m "message"' });
    });
    (0, vitest_1.it)('複数のコードブロックを抽出する', () => {
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
        const blocks = (0, markdown_1.extractCodeBlocks)(content);
        (0, vitest_1.expect)(blocks).toHaveLength(2);
        (0, vitest_1.expect)(blocks[0].lang).toBe('bash');
        (0, vitest_1.expect)(blocks[0].code).toBe('docker ps');
        (0, vitest_1.expect)(blocks[1].lang).toBe('yaml');
        (0, vitest_1.expect)(blocks[1].code).toContain('services:');
    });
    (0, vitest_1.it)('言語指定がないコードブロックを抽出する', () => {
        const content = '```\nplain code\n```';
        const blocks = (0, markdown_1.extractCodeBlocks)(content);
        (0, vitest_1.expect)(blocks).toHaveLength(1);
        (0, vitest_1.expect)(blocks[0]).toEqual({ lang: '', code: 'plain code' });
    });
    (0, vitest_1.it)('複数行のコードを保持する', () => {
        const content = '```bash\ngit add .\ngit commit\ngit push\n```';
        const blocks = (0, markdown_1.extractCodeBlocks)(content);
        (0, vitest_1.expect)(blocks).toHaveLength(1);
        (0, vitest_1.expect)(blocks[0].code).toBe('git add .\ngit commit\ngit push');
    });
    (0, vitest_1.it)('コードブロックがない場合は空配列を返す', () => {
        const content = '# Title\n\nJust text with `inline code`.';
        (0, vitest_1.expect)((0, markdown_1.extractCodeBlocks)(content)).toEqual([]);
    });
    (0, vitest_1.it)('空のコードブロックは除外する', () => {
        const content = '```bash\n\n```\n\n```bash\ngit status\n```';
        const blocks = (0, markdown_1.extractCodeBlocks)(content);
        (0, vitest_1.expect)(blocks).toHaveLength(1);
        (0, vitest_1.expect)(blocks[0].code).toBe('git status');
    });
    (0, vitest_1.it)('閉じられていないコードブロックは無視する', () => {
        const content = '```bash\ngit status';
        (0, vitest_1.expect)((0, markdown_1.extractCodeBlocks)(content)).toEqual([]);
    });
});
//# sourceMappingURL=codeblocks.test.js.map