import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { getAllSheets } from '../lib/storage';

export const listCommand = new Command('list')
  .description('チートシート一覧を表示')
  .action(async () => {
    try {
      const sheets = await getAllSheets();

      if (sheets.length === 0) {
        console.log(chalk.yellow('チートシートがありません'));
        return;
      }

      // 更新日時でソート（新しい順）
      sheets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      const table = new Table({
        head: [
          chalk.cyan('名前'),
          chalk.cyan('種類'),
          chalk.cyan('更新日時'),
        ],
        colWidths: [30, 10, 25],
      });

      for (const sheet of sheets) {
        const typeLabel = sheet.type === 'text' ? 'テキスト' : '画像';
        const updatedAt = new Date(sheet.updatedAt).toLocaleString('ja-JP');
        table.push([sheet.name, typeLabel, updatedAt]);
      }

      console.log(table.toString());
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
