import { Command, Option } from 'commander';
import chalk from 'chalk';
import open from 'open';
import { getSheet, readSheetContent, getSheetFilePath } from '../lib/storage';
import { renderMarkdown } from '../lib/markdown';

export const showCommand = new Command('show')
  .description('チートシートの内容を表示')
  .argument('<name>', 'チートシートの名前')
  .addOption(new Option('-o, --open', '外部ビューアで開く（画像の場合）').hideHelp())
  .option('-r, --raw', '生のMarkdownを表示')
  .action(async (name: string, options: { open?: boolean; raw?: boolean }) => {
    try {
      const sheet = await getSheet(name);

      if (!sheet) {
        console.error(chalk.red(`エラー: シート "${name}" が見つかりません`));
        process.exit(1);
      }

      if (sheet.type === 'text') {
        const content = await readSheetContent(sheet);
        if (options.raw) {
          console.log(content);
        } else {
          console.log(renderMarkdown(content));
        }
      } else {
        const filePath = getSheetFilePath(sheet);
        console.log(chalk.cyan(`画像ファイル: ${filePath}`));

        if (options.open) {
          await open(filePath);
          console.log(chalk.green('外部ビューアで開きました'));
        } else {
          console.log(chalk.gray('--open オプションで外部ビューアで開けます'));
        }
      }
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
