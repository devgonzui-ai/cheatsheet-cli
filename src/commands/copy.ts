import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import clipboard from 'clipboardy';
import { getSheet, readSheetContent } from '../lib/storage';
import { extractCodeBlocks, CodeBlock } from '../lib/markdown';

// 番号選択プロンプト
const promptBlockIndex = async (max: number): Promise<number | undefined> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.yellow(`Which block do you want to copy? (1-${max}): `), (answer) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      if (isNaN(num) || num < 1 || num > max) {
        resolve(undefined);
      } else {
        resolve(num);
      }
    });
  });
};

// コードブロックのプレビューを表示
const printBlockList = (blocks: CodeBlock[]): void => {
  blocks.forEach((block, i) => {
    const langLabel = block.lang ? chalk.blue(`[${block.lang}]`) : chalk.gray('[text]');
    console.log(chalk.bold(`  ${i + 1}.`) + ` ${langLabel}`);
    const lines = block.code.split('\n');
    const preview = lines.slice(0, 3);
    for (const line of preview) {
      console.log(chalk.gray('     ') + line);
    }
    if (lines.length > 3) {
      console.log(chalk.gray(`     ... (${lines.length - 3} more line(s))`));
    }
    console.log();
  });
};

export const copyCommand = new Command('copy')
  .description('Copy a code block from a cheatsheet to the clipboard')
  .argument('<name>', 'Name of the cheatsheet')
  .argument('[index]', 'Code block number to copy (1-based)')
  .option('-a, --all', 'Copy the entire sheet content')
  .action(async (name: string, indexArg: string | undefined, options: { all?: boolean }) => {
    try {
      const sheet = await getSheet(name);

      if (!sheet) {
        console.error(chalk.red(`Error: Sheet "${name}" not found`));
        process.exit(1);
      }

      if (sheet.type === 'image') {
        console.error(chalk.red('Error: Cannot copy image sheets to the clipboard'));
        process.exit(1);
      }

      const content = await readSheetContent(sheet);

      // シート全体をコピー
      if (options.all) {
        await clipboard.write(content);
        console.log(chalk.green(`Copied entire sheet "${name}" to the clipboard`));
        return;
      }

      const blocks = extractCodeBlocks(content);

      // コードブロックがない場合はシート全体をコピー
      if (blocks.length === 0) {
        await clipboard.write(content);
        console.log(
          chalk.green(`No code blocks found. Copied entire sheet "${name}" to the clipboard`)
        );
        return;
      }

      // 番号指定あり
      if (indexArg !== undefined) {
        const index = parseInt(indexArg, 10);
        if (isNaN(index) || index < 1 || index > blocks.length) {
          console.error(
            chalk.red(`Error: Invalid block number "${indexArg}" (available: 1-${blocks.length})`)
          );
          process.exit(1);
        }
        await clipboard.write(blocks[index - 1].code);
        console.log(chalk.green(`Copied code block #${index} to the clipboard`));
        return;
      }

      // ブロックが1つなら即コピー
      if (blocks.length === 1) {
        await clipboard.write(blocks[0].code);
        console.log(chalk.green('Copied code block to the clipboard'));
        return;
      }

      // 複数ブロックは一覧表示して選択
      console.log(chalk.bold(`Found ${blocks.length} code blocks in "${name}":\n`));
      printBlockList(blocks);

      const selected = await promptBlockIndex(blocks.length);
      if (selected === undefined) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }

      await clipboard.write(blocks[selected - 1].code);
      console.log(chalk.green(`Copied code block #${selected} to the clipboard`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
