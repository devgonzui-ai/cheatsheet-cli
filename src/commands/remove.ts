import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { getSheet, removeSheet } from '../lib/storage';

// 削除確認プロンプト
const confirmDelete = async (name: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(`シート "${name}" を削除しますか？ (y/N): `),
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      }
    );
  });
};

export const removeCommand = new Command('rm')
  .description('チートシートを削除')
  .argument('<name>', 'チートシートの名前')
  .option('-f, --force', '確認をスキップ')
  .action(async (name: string, options: { force?: boolean }) => {
    try {
      const sheet = await getSheet(name);

      if (!sheet) {
        console.error(chalk.red(`エラー: シート "${name}" が見つかりません`));
        process.exit(1);
      }

      if (!options.force) {
        const shouldDelete = await confirmDelete(name);
        if (!shouldDelete) {
          console.log(chalk.yellow('キャンセルしました'));
          return;
        }
      }

      await removeSheet(name);
      console.log(chalk.green(`シート "${name}" を削除しました`));
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
