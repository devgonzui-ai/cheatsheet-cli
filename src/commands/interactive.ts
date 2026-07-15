import chalk from 'chalk';
import search from '@inquirer/search';
import { Sheet } from '../types';
import { getAllSheets, readSheetContent, getSheetFilePath } from '../lib/storage';
import { renderMarkdown } from '../lib/markdown';
import { fuzzyMatch } from '../lib/search';
import { formatTags } from '../lib/tags';

// 入力にマッチするシートを絞り込む（部分一致優先、次にfuzzy）
export const filterSheets = (sheets: Sheet[], input: string): Sheet[] => {
  const keyword = input.trim();
  if (keyword === '') {
    return sheets;
  }
  const lowerKeyword = keyword.toLowerCase();
  const substringMatches = sheets.filter((s) => s.name.toLowerCase().includes(lowerKeyword));
  const fuzzyMatches = sheets.filter(
    (s) => !s.name.toLowerCase().includes(lowerKeyword) && fuzzyMatch(s.name, keyword)
  );
  return [...substringMatches, ...fuzzyMatches];
};

// 引数なしで `cs` を実行したときのインクリメンタル検索モード
export const runInteractive = async (): Promise<void> => {
  const sheets = await getAllSheets();

  if (sheets.length === 0) {
    console.log(chalk.yellow('No cheatsheets found. Add one with `cs add <name>`'));
    return;
  }

  let selectedName: string;
  try {
    selectedName = await search<string>({
      message: 'Select a cheatsheet (type to filter):',
      source: async (input) => {
        return filterSheets(sheets, input || '').map((sheet) => ({
          name: sheet.tags?.length ? `${sheet.name}  [${formatTags(sheet.tags)}]` : sheet.name,
          value: sheet.name,
        }));
      },
    });
  } catch (error) {
    // Ctrl+C での中断は静かに終了
    if ((error as Error).name === 'ExitPromptError') {
      return;
    }
    throw error;
  }

  const sheet = sheets.find((s) => s.name === selectedName);
  if (!sheet) {
    return;
  }

  if (sheet.type === 'text') {
    const content = await readSheetContent(sheet);
    console.log(renderMarkdown(content));
  } else {
    console.log(chalk.cyan(`Image file: ${getSheetFilePath(sheet)}`));
    console.log(chalk.gray(`Use \`cs show ${sheet.name} --open\` to open with external viewer`));
  }
};
