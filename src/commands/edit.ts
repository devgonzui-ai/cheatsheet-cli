import { Command } from 'commander';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { getSheet, addOrUpdateSheet, getSheetFilePath } from '../lib/storage';
import { getEditor } from '../lib/config';

// エディタを起動してテキストを編集
const openEditor = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const editor = getEditor();
    const child = spawn(editor, [filePath], {
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`エディタが終了コード ${code} で終了しました`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};

export const editCommand = new Command('edit')
  .description('チートシートを編集（テキストのみ）')
  .argument('<name>', 'チートシートの名前')
  .action(async (name: string) => {
    try {
      const sheet = await getSheet(name);

      if (!sheet) {
        console.error(chalk.red(`エラー: シート "${name}" が見つかりません`));
        process.exit(1);
      }

      if (sheet.type !== 'text') {
        console.error(chalk.red('エラー: 画像シートは編集できません'));
        process.exit(1);
      }

      const filePath = getSheetFilePath(sheet);
      await openEditor(filePath);

      // 更新日時を更新
      sheet.updatedAt = new Date().toISOString();
      await addOrUpdateSheet(sheet);

      console.log(chalk.green(`シート "${name}" を更新しました`));
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
