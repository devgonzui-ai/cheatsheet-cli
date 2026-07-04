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
import { parseTags, validateTags } from '../lib/tags';
import { getEditor, SHEETS_DIR, IMAGES_DIR } from '../lib/config';

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
        reject(new Error(`Editor exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};

// 標準入力を全て読み込む
const readStdin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', (err) => reject(err));
  });
};

interface AddOptions {
  file?: string;
  image?: string;
  stdin?: boolean;
  tag?: string;
  force?: boolean;
}

export const addCommand = new Command('add')
  .description('Add a cheatsheet')
  .argument('<name>', 'Name of the cheatsheet')
  .option('-f, --file <path>', 'Add from existing file')
  .option('-s, --stdin', 'Read content from stdin (e.g. `tldr tar | cs add tar-tips --stdin`)')
  .option('-t, --tag <tags>', 'Comma-separated tags (e.g. --tag git,vcs)')
  .option('--force', 'Overwrite existing sheet without confirmation')
  .addOption(new Option('-i, --image <path>', '画像ファイルを追加').hideHelp())
  .action(async (name: string, options: AddOptions) => {
    // 名前のバリデーション
    if (!validateName(name)) {
      console.error(
        chalk.red('Error: Name can only contain alphanumeric characters, hyphens, and underscores')
      );
      process.exit(1);
    }

    // タグのパースとバリデーション
    let tags: string[] | undefined;
    if (options.tag) {
      tags = parseTags(options.tag);
      const invalidTags = validateTags(tags);
      if (invalidTags.length > 0) {
        console.error(
          chalk.red(
            `Error: Invalid tag(s): ${invalidTags.join(', ')} (only alphanumeric characters, hyphens, and underscores are allowed)`
          )
        );
        process.exit(1);
      }
    }

    // 既存シートのチェック
    const existingSheet = await getSheet(name);
    if (existingSheet && !options.force) {
      if (options.stdin) {
        // stdinがパイプで塞がっているため確認プロンプトが使えない
        console.error(
          chalk.red(`Error: Sheet "${name}" already exists. Use --force to overwrite when using --stdin`)
        );
        process.exit(1);
      }
      const shouldOverwrite = await confirmOverwrite(name);
      if (!shouldOverwrite) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }
    }

    // タグ未指定で上書きする場合は既存のタグを引き継ぐ
    if (!tags && existingSheet?.tags) {
      tags = existingSheet.tags;
    }

    const now = new Date().toISOString();

    try {
      if (options.image) {
        // 画像ファイルから追加
        const imagePath = path.resolve(options.image);

        if (!(await fs.pathExists(imagePath))) {
          console.error(chalk.red(`Error: File not found: ${imagePath}`));
          process.exit(1);
        }

        if (!isValidImageExtension(imagePath)) {
          console.error(
            chalk.red('Error: Unsupported image format (png, jpg, jpeg, gif, webp, svg)')
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
          tags,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`Added image sheet "${name}"`));
      } else if (options.stdin) {
        // 標準入力から追加
        if (process.stdin.isTTY) {
          console.error(chalk.red('Error: No input piped. Usage: <command> | cs add <name> --stdin'));
          process.exit(1);
        }

        const content = await readStdin();
        if (content.trim() === '') {
          console.log(chalk.yellow('Cancelled due to empty content'));
          return;
        }

        const filename = `${name}.md`;
        const destPath = path.join(SHEETS_DIR, filename);

        await fs.writeFile(destPath, content, 'utf-8');

        const sheet: Sheet = {
          name,
          type: 'text',
          filename,
          tags,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`Added text sheet "${name}" from stdin`));
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
          tags,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`Added text sheet "${name}"`));
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
          console.log(chalk.yellow('Cancelled due to empty content'));
          return;
        }

        const sheet: Sheet = {
          name,
          type: 'text',
          filename,
          tags,
          createdAt: existingSheet?.createdAt || now,
          updatedAt: now,
        };

        await addOrUpdateSheet(sheet);
        console.log(chalk.green(`Added text sheet "${name}"`));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
