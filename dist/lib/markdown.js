"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdown = exports.formatTable = exports.processInline = exports.formatCodeBlock = exports.getDisplayWidth = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { highlight } = require('cli-highlight');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stringWidth = require('string-width');
// ANSIエスケープコードを除去した文字列の表示幅を取得
const getDisplayWidth = (str) => {
    const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
    return stringWidth(stripped);
};
exports.getDisplayWidth = getDisplayWidth;
// コードブロックをボックスで囲む
const formatCodeBlock = (code, lang) => {
    let highlighted;
    try {
        highlighted = highlight(code.trim(), { language: lang || 'bash', ignoreIllegals: true });
    }
    catch {
        highlighted = code.trim();
    }
    const lines = highlighted.split('\n');
    const maxLen = Math.max(...lines.map(l => (0, exports.getDisplayWidth)(l)), 30);
    const langLabel = lang ? chalk_1.default.bgBlue.black(` ${lang} `) + '\n' : '';
    const boxedLines = lines.map(line => {
        const visibleLen = (0, exports.getDisplayWidth)(line);
        const padding = ' '.repeat(Math.max(0, maxLen - visibleLen));
        return chalk_1.default.gray('│ ') + line + padding + chalk_1.default.gray(' │');
    });
    return langLabel + chalk_1.default.gray('┌' + '─'.repeat(maxLen + 2) + '┐') + '\n' +
        boxedLines.join('\n') + '\n' +
        chalk_1.default.gray('└' + '─'.repeat(maxLen + 2) + '┘');
};
exports.formatCodeBlock = formatCodeBlock;
// インライン要素の処理
const processInline = (text) => {
    // インラインコード
    text = text.replace(/`([^`]+)`/g, (_, code) => chalk_1.default.bgGray.white(` ${code} `));
    // 太字
    text = text.replace(/\*\*([^*]+)\*\*/g, (_, t) => chalk_1.default.bold.yellow(t));
    // 斜体
    text = text.replace(/\*([^*]+)\*/g, (_, t) => chalk_1.default.italic(t));
    return text;
};
exports.processInline = processInline;
// テーブルをフォーマット
const formatTable = (tableLines) => {
    const rows = tableLines
        .filter(line => !line.match(/^\|[-:\s|]+\|$/)) // セパレータ行を除外
        .map(line => {
        return line
            .split('|')
            .slice(1, -1) // 先頭と末尾の空要素を除去
            .map(cell => (0, exports.processInline)(cell.trim()));
    });
    if (rows.length === 0)
        return '';
    const table = new cli_table3_1.default({
        head: rows[0].map(h => chalk_1.default.cyan(h)),
        chars: {
            'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
            'right': '│', 'right-mid': '┤', 'middle': '│'
        },
        style: { head: [], border: ['gray'] }
    });
    rows.slice(1).forEach(row => table.push(row));
    return table.toString();
};
exports.formatTable = formatTable;
// カスタムMarkdownレンダラー
const renderMarkdown = (content) => {
    const lines = content.split('\n');
    const result = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockContent = [];
    let inTable = false;
    let tableContent = [];
    for (const line of lines) {
        // コードブロックの開始/終了
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockLang = line.slice(3).trim();
                codeBlockContent = [];
            }
            else {
                result.push((0, exports.formatCodeBlock)(codeBlockContent.join('\n'), codeBlockLang));
                inCodeBlock = false;
                codeBlockLang = '';
            }
            continue;
        }
        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }
        // テーブルの処理
        const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
        if (isTableLine) {
            if (!inTable) {
                inTable = true;
                tableContent = [];
            }
            tableContent.push(line);
            continue;
        }
        else if (inTable) {
            result.push((0, exports.formatTable)(tableContent));
            inTable = false;
            tableContent = [];
        }
        // 見出し
        if (line.startsWith('# ')) {
            result.push('\n' + chalk_1.default.bold.magenta.underline(line.slice(2)) + '\n');
            continue;
        }
        if (line.startsWith('## ')) {
            result.push('\n' + chalk_1.default.bold.cyan(line.slice(3)));
            continue;
        }
        if (line.startsWith('### ')) {
            result.push('\n' + chalk_1.default.bold.green(line.slice(4)));
            continue;
        }
        // リスト
        if (line.match(/^[-*] /)) {
            result.push(chalk_1.default.yellow('  • ') + (0, exports.processInline)(line.slice(2)));
            continue;
        }
        // 水平線
        if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/)) {
            result.push(chalk_1.default.gray('─'.repeat(40)));
            continue;
        }
        // 通常行
        result.push((0, exports.processInline)(line));
    }
    // 末尾のテーブル処理
    if (inTable) {
        result.push((0, exports.formatTable)(tableContent));
    }
    return result.join('\n');
};
exports.renderMarkdown = renderMarkdown;
//# sourceMappingURL=markdown.js.map