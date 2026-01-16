import { Command, Option } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { spawn } from 'child_process';
import readline from 'readline';
import { Sheet } from '../types';
import {
  validateName,
  getSheet,
  addOrUpdateSheet,
  isValidImageExtension,
  copyFile,
} from '../lib/storage';
import { getEditor, SHEETS_DIR, IMAGES_DIR } from '../lib/config';

// 上書き確認プロンプト
const confirmOverwrite = async (name: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      chalk.yellow(`シート "${name}" は既に存在します。上書きしますか？ (y/N): `),
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      }
    );
  });
};

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

export const addCommand = new Command('add')
  .description('チートシートを追加')
  .argument('<name>', 'チートシートの名前')
  .option('-f, --file <path>', '既存ファイルから追加')
  .addOption(new Option('-i, --image <path>', '画像ファイルを追加').hideHelp())
  .action(async (name: string, options: { file?: string; image?: string }) => {
    // 名前のバリデーション
    if (!validateName(name)) {
      console.error(
        chalk.red('エラー: 名前には英数字、ハイフン、アンダースコアのみ使用できます')
      );
      process.exit(1);
    }

    // 既存シートのチェック
    const existingSheet = await getSheet(name);
    if (existingSheet) {
      const shouldOverwrite = await confirmOverwrite(name);
      if (!shouldOverwrite) {
        console.log(chalk.yellow('キャンセルしました'));
        return;
      }
    }

    const now = new Date().toISOString();

    try {
      if (options.image) {
        // 画像ファイルから追加
        const imagePath = path.resolve(options.image);

        if (!(await fs.pathExists(imagePath))) {
          console.error(chalk.red(`エラー: ファイルが見つかりません: ${imagePath}`));
          process.exit(1);
        }

        if (!isValidImageExtension(imagePath)) {
          console.error(
            chalk.red('エラー: サポートされていない画像形式です (png, jpg, jpeg, gif, webp, svg)')
          );
          process.exit(1);
        }

        const ext = path.extname(imagePath);
        const filename = `${name}${ext}`;
        const destPath = path.join(IMAGES_DIR, filename);

        await copyFile(imagePath, destPath);

        const sheet: Sheet = {
          name,
          type: 'image',
          filename,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`画像シート "${name}" を追加しました`));
      } else if (options.file) {
        // 既存テキストファイルから追加
        const filePath = path.resolve(options.file);

        if (!(await fs.pathExists(filePath))) {
          console.error(chalk.red(`エラー: ファイルが見つかりません: ${filePath}`));
          process.exit(1);
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const filename = `${name}.md`;
        const destPath = path.join(SHEETS_DIR, filename);

        await fs.writeFile(destPath, content, 'utf-8');

        const sheet: Sheet = {
          name,
          type: 'text',
          filename,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`テキストシート "${name}" を追加しました`));
      } else {
        // エディタで新規作成
        const filename = `${name}.md`;
        const filePath = path.join(SHEETS_DIR, filename);

        // 既存のファイルがない場合は空ファイルを作成
        if (!(await fs.pathExists(filePath))) {
          await fs.writeFile(filePath, '', 'utf-8');
        }

        await openEditor(filePath);

        // エディタ終了後、ファイルが空でないかチェック
        const content = await fs.readFile(filePath, 'utf-8');
        if (content.trim() === '') {
          await fs.remove(filePath);
          console.log(chalk.yellow('内容が空のためキャンセルしました'));
          return;
        }

        const sheet: Sheet = {
          name,
          type: 'text',
          filename,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`テキストシート "${name}" を追加しました`));
      }
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
