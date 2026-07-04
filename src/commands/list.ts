import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getAllSheets } from '../lib/storage';
import { matchByTag, formatTags } from '../lib/tags';

export const listCommand = new Command('list')
  .description('List all cheatsheets')
  .option('-t, --tag <tag>', 'Filter by tag')
  .action(async (options: { tag?: string }) => {
    try {
      let sheets = await getAllSheets();

      // タグで絞り込み
      if (options.tag) {
        sheets = sheets.filter((sheet) => matchByTag(sheet, options.tag as string));
      }

      if (sheets.length === 0) {
        if (options.tag) {
          console.log(chalk.yellow(`No cheatsheets found with tag "${options.tag}"`));
        } else {
          console.log(chalk.yellow('No cheatsheets found'));
        }
        return;
      }

      // 更新日時でソート（新しい順）
      sheets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      const table = new Table({
        head: [
          chalk.cyan('Name'),
          chalk.cyan('Type'),
          chalk.cyan('Tags'),
          chalk.cyan('Updated'),
        ],
        colWidths: [30, 10, 20, 25],
      });

      for (const sheet of sheets) {
        const typeLabel = sheet.type === 'text' ? 'Text' : 'Image';
        const updatedAt = new Date(sheet.updatedAt).toLocaleString('en-US');
        table.push([sheet.name, typeLabel, formatTags(sheet.tags), updatedAt]);
      }

      console.log(table.toString());
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
