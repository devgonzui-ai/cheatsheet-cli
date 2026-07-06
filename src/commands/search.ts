import { Command } from 'commander';
import chalk from 'chalk';
import { getAllSheets, readSheetContent } from '../lib/storage';
import { matchByTag } from '../lib/tags';
import { fuzzyMatch, findMatchingLines, highlightKeyword, MatchLine } from '../lib/search';

interface ResultEntry {
  name: string;
  type: string;
  matchType: string;
  contextLines?: MatchLine[];
}

// 長い行はマッチ箇所が見えるように前後を切り出す
const excerptAroundMatch = (line: string, keyword: string, maxLength = 100): string => {
  if (line.length <= maxLength) {
    return line;
  }
  const index = line.toLowerCase().indexOf(keyword.toLowerCase());
  const start = Math.max(0, index - 30);
  const excerpt = line.slice(start, start + maxLength);
  return `${start > 0 ? '...' : ''}${excerpt}${start + maxLength < line.length ? '...' : ''}`;
};

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
      const results: ResultEntry[] = [];

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
          const type = sheet.type === 'text' ? 'Text' : 'Image';

          // 名前で検索（部分一致 → fuzzy の順）
          if (sheet.name.toLowerCase().includes(lowerKeyword)) {
            results.push({ name: sheet.name, type, matchType: 'name' });
            continue;
          }
          if (fuzzyMatch(sheet.name, keyword)) {
            results.push({ name: sheet.name, type, matchType: 'name (fuzzy)' });
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
                contextLines: findMatchingLines(content, keyword),
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

        // grep風にマッチ行を表示
        if (keyword && result.contextLines) {
          for (const match of result.contextLines) {
            console.log(
              `    ${chalk.gray(`${match.lineNumber}:`)} ${highlightKeyword(excerptAroundMatch(match.line, keyword), keyword, (m) => chalk.bold.yellow(m))}`
            );
          }
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
