import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import readline from 'readline';
import { Sheet } from '../types';
import { validateName, getSheet, addOrUpdateSheet } from '../lib/storage';
import { parseTags, validateTags } from '../lib/tags';
import { SHEETS_DIR } from '../lib/config';
import { renderMarkdown } from '../lib/markdown';
import { fetchCheatSheet, toMarkdown, topicToSheetName } from '../lib/cheatsh';

// 上書き確認プロンプト
const confirmOverwrite = async (name: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.yellow(`Sheet "${name}" already exists. Overwrite? (y/N): `), (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

interface FetchOptions {
  save?: string | boolean;
  tag?: string;
  force?: boolean;
  raw?: boolean;
}

export const fetchCommand = new Command('fetch')
  .description('Fetch a cheatsheet from cheat.sh (e.g. `cs fetch tar`)')
  .argument('<topic>', 'Topic on cheat.sh (e.g. tar, python/lists)')
  .option('-s, --save [name]', 'Save locally (defaults to a name derived from the topic)')
  .option('-t, --tag <tags>', 'Comma-separated tags (implies --save)')
  .option('--force', 'Overwrite existing sheet without confirmation')
  .option('-r, --raw', 'Print raw Markdown instead of rendering it')
  .action(async (topic: string, options: FetchOptions) => {
    // --tag だけ指定されたときも保存する意図とみなす
    const shouldSave = options.save !== undefined || options.tag !== undefined;

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

    // 保存名: --save <name> が明示されていればそれ、なければトピックから生成
    const name = typeof options.save === 'string' ? options.save : topicToSheetName(topic);

    if (shouldSave && !validateName(name)) {
      console.error(
        chalk.red(
          `Error: "${name}" is not a valid sheet name. Pass one explicitly with --save <name>`
        )
      );
      process.exit(1);
    }

    try {
      // 保存する場合は取得前に上書き確認を済ませる
      let existingSheet: Sheet | undefined;
      if (shouldSave) {
        existingSheet = await getSheet(name);
        if (existingSheet && !options.force) {
          if (!process.stdin.isTTY) {
            console.error(
              chalk.red(`Error: Sheet "${name}" already exists. Use --force to overwrite`)
            );
            process.exit(1);
          }
          const shouldOverwrite = await confirmOverwrite(name);
          if (!shouldOverwrite) {
            console.log(chalk.yellow('Cancelled'));
            return;
          }
        }
      }

      const content = await fetchCheatSheet(topic);
      const markdown = toMarkdown(topic, content);

      if (!shouldSave) {
        console.log(options.raw ? markdown : renderMarkdown(markdown));
        console.log(chalk.gray(`Use --save to keep this locally (cs fetch ${topic} --save)`));
        return;
      }

      // タグ未指定で上書きする場合は既存のタグを引き継ぐ
      if (!tags && existingSheet?.tags) {
        tags = existingSheet.tags;
      }

      const filename = `${name}.md`;
      await fs.writeFile(path.join(SHEETS_DIR, filename), markdown, 'utf-8');

      const now = new Date().toISOString();
      const sheet: Sheet = {
        name,
        type: 'text',
        filename,
        tags,
        createdAt: existingSheet?.createdAt || now,
        updatedAt: now,
      };

      await addOrUpdateSheet(sheet);
      console.log(chalk.green(`Saved "${name}" from cheat.sh/${topic}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
