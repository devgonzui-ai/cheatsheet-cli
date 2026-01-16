import { Command } from 'commander';
import chalk from 'chalk';
import { getAllSheets, readSheetContent } from '../lib/storage';

export const searchCommand = new Command('search')
  .description('チートシートをキーワード検索')
  .argument('<keyword>', '検索キーワード')
  .action(async (keyword: string) => {
    try {
      const sheets = await getAllSheets();
      const lowerKeyword = keyword.toLowerCase();
      const results: { name: string; type: string; matchType: string }[] = [];

      for (const sheet of sheets) {
        // 名前で検索
        if (sheet.name.toLowerCase().includes(lowerKeyword)) {
          results.push({
            name: sheet.name,
            type: sheet.type === 'text' ? 'テキスト' : '画像',
            matchType: '名前',
          });
          continue;
        }

        // テキストシートの場合は内容も検索
        if (sheet.type === 'text') {
          const content = await readSheetContent(sheet);
          if (content.toLowerCase().includes(lowerKeyword)) {
            results.push({
              name: sheet.name,
              type: 'テキスト',
              matchType: '内容',
            });
          }
        }
      }

      if (results.length === 0) {
        console.log(chalk.yellow(`"${keyword}" に一致するシートが見つかりませんでした`));
        return;
      }

      console.log(chalk.green(`${results.length} 件見つかりました:\n`));

      for (const result of results) {
        console.log(
          `  ${chalk.cyan(result.name)} (${result.type}) - ${chalk.gray(result.matchType + 'で一致')}`
        );
      }
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
