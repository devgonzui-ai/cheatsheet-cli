import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { getSheet, renameSheet, validateName, removeSheet } from '../lib/storage';

// 上書き確認プロンプト
const confirmOverwrite = async (name: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(`Sheet "${name}" already exists. Overwrite? (y/N): `),
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      }
    );
  });
};

export const renameCommand = new Command('rename')
  .description('Rename a cheatsheet')
  .argument('<old-name>', 'Current name of the cheatsheet')
  .argument('<new-name>', 'New name for the cheatsheet')
  .option('-f, --force', 'Overwrite if new name exists')
  .action(async (oldName: string, newName: string, options: { force?: boolean }) => {
    try {
      // 同じ名前の場合
      if (oldName === newName) {
        console.error(chalk.red('Error: Old name and new name are the same'));
        process.exit(1);
      }

      // 新しい名前のバリデーション
      if (!validateName(newName)) {
        console.error(chalk.red('Error: Invalid name. Use only alphanumeric characters, hyphens, and underscores'));
        process.exit(1);
      }

      // 古い名前のシートが存在するか確認
      const oldSheet = await getSheet(oldName);
      if (!oldSheet) {
        console.error(chalk.red(`Error: Sheet "${oldName}" not found`));
        process.exit(1);
      }

      // 新しい名前のシートが既に存在するか確認
      const existingSheet = await getSheet(newName);
      if (existingSheet) {
        if (!options.force) {
          const shouldOverwrite = await confirmOverwrite(newName);
          if (!shouldOverwrite) {
            console.log(chalk.yellow('Cancelled'));
            return;
          }
        }
        // 既存のシートを削除
        await removeSheet(newName);
      }

      // リネーム実行
      const success = await renameSheet(oldName, newName);
      if (success) {
        console.log(chalk.green(`Renamed "${oldName}" to "${newName}"`));
      } else {
        console.error(chalk.red(`Error: Failed to rename sheet`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
