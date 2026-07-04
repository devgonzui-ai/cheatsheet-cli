import { Command } from 'commander';
import chalk from 'chalk';
import { getAllSheets, readSheetContent } from '../lib/storage';
import { matchByTag } from '../lib/tags';

export const searchCommand = new Command('search')
  .description('Search cheatsheets by keyword and/or tag')
  .argument('[keyword]', 'Search keyword')
  .option('-t, --tag <tag>', 'Filter by tag')
  .action(async (keyword: string | undefined, options: { tag?: string }) => {
    if (!keyword && !options.tag) {
      console.error(chalk.red('Error: Specify a keyword and/or --tag <tag>'));
      process.exit(1);
    }

    try {
      let sheets = await getAllSheets();
      const results: { name: string; type: string; matchType: string }[] = [];

      // タグで絞り込み
      if (options.tag) {
        sheets = sheets.filter((sheet) => matchByTag(sheet, options.tag as string));
      }

      if (!keyword) {
        // タグのみの検索
        for (const sheet of sheets) {
          results.push({
            name: sheet.name,
            type: sheet.type === 'text' ? 'Text' : 'Image',
            matchType: 'tag',
          });
        }
      } else {
        const lowerKeyword = keyword.toLowerCase();

        for (const sheet of sheets) {
          // 名前で検索
          if (sheet.name.toLowerCase().includes(lowerKeyword)) {
            results.push({
              name: sheet.name,
              type: sheet.type === 'text' ? 'Text' : 'Image',
              matchType: 'name',
            });
            continue;
          }

          // テキストシートの場合は内容も検索
          if (sheet.type === 'text') {
            const content = await readSheetContent(sheet);
            if (content.toLowerCase().includes(lowerKeyword)) {
              results.push({
                name: sheet.name,
                type: 'Text',
                matchType: 'content',
              });
            }
          }
        }
      }

      if (results.length === 0) {
        const criteria = [
          keyword ? `"${keyword}"` : '',
          options.tag ? `tag "${options.tag}"` : '',
        ]
          .filter(Boolean)
          .join(' with ');
        console.log(chalk.yellow(`No sheets found matching ${criteria}`));
        return;
      }

      console.log(chalk.green(`Found ${results.length} result(s):\n`));

      for (const result of results) {
        console.log(
          `  ${chalk.cyan(result.name)} (${result.type}) - ${chalk.gray('matched by ' + result.matchType)}`
        );
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
