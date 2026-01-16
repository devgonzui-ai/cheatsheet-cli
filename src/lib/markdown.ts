import chalk from 'chalk';
import Table from 'cli-table3';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { highlight } = require('cli-highlight');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const stringWidth = require('string-width');

// ANSIエスケープコードを除去した文字列の表示幅を取得
export const getDisplayWidth = (str: string): number => {
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
  return stringWidth(stripped);
};

// コードブロックをボックスで囲む
export const formatCodeBlock = (code: string, lang: string): string => {
  let highlighted: string;
  try {
    highlighted = highlight(code.trim(), { language: lang || 'bash', ignoreIllegals: true });
  } catch {
    highlighted = code.trim();
  }

  const lines = highlighted.split('\n');
  const maxLen = Math.max(...lines.map(l => getDisplayWidth(l)), 30);
  const langLabel = lang ? chalk.bgBlue.black(` ${lang} `) + '\n' : '';

  const boxedLines = lines.map(line => {
    const visibleLen = getDisplayWidth(line);
    const padding = ' '.repeat(Math.max(0, maxLen - visibleLen));
    return chalk.gray('│ ') + line + padding + chalk.gray(' │');
  });

  return langLabel + chalk.gray('┌' + '─'.repeat(maxLen + 2) + '┐') + '\n' +
    boxedLines.join('\n') + '\n' +
    chalk.gray('└' + '─'.repeat(maxLen + 2) + '┘');
};

// インライン要素の処理
export const processInline = (text: string): string => {
  // インラインコード
  text = text.replace(/`([^`]+)`/g, (_, code) => chalk.bgGray.white(` ${code} `));
  // 太字
  text = text.replace(/\*\*([^*]+)\*\*/g, (_, t) => chalk.bold.yellow(t));
  // 斜体
  text = text.replace(/\*([^*]+)\*/g, (_, t) => chalk.italic(t));

  return text;
};

// テーブルをフォーマット
export const formatTable = (tableLines: string[]): string => {
  const rows = tableLines
    .filter(line => !line.match(/^\|[-:\s|]+\|$/)) // セパレータ行を除外
    .map(line => {
      return line
        .split('|')
        .slice(1, -1) // 先頭と末尾の空要素を除去
        .map(cell => processInline(cell.trim()));
    });

  if (rows.length === 0) return '';

  const table = new Table({
    head: rows[0].map(h => chalk.cyan(h)),
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

// カスタムMarkdownレンダラー
export const renderMarkdown = (content: string): string => {
  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let inTable = false;
  let tableContent: string[] = [];

  for (const line of lines) {
    // コードブロックの開始/終了
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        codeBlockContent = [];
      } else {
        result.push(formatCodeBlock(codeBlockContent.join('\n'), codeBlockLang));
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
    } else if (inTable) {
      result.push(formatTable(tableContent));
      inTable = false;
      tableContent = [];
    }

    // 見出し
    if (line.startsWith('# ')) {
      result.push('\n' + chalk.bold.magenta.underline(line.slice(2)) + '\n');
      continue;
    }
    if (line.startsWith('## ')) {
      result.push('\n' + chalk.bold.cyan(line.slice(3)));
      continue;
    }
    if (line.startsWith('### ')) {
      result.push('\n' + chalk.bold.green(line.slice(4)));
      continue;
    }

    // リスト
    if (line.match(/^[-*] /)) {
      result.push(chalk.yellow('  • ') + processInline(line.slice(2)));
      continue;
    }

    // 水平線
    if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/)) {
      result.push(chalk.gray('─'.repeat(40)));
      continue;
    }

    // 通常行
    result.push(processInline(line));
  }

  // 末尾のテーブル処理
  if (inTable) {
    result.push(formatTable(tableContent));
  }

  return result.join('\n');
};
