import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { Sheet } from '../types';
import { validateName, getSheet, addOrUpdateSheet } from '../lib/storage';
import { parseTags, validateTags } from '../lib/tags';
import { SHEETS_DIR } from '../lib/config';
import { AI_MODEL, generateCheatsheet, formatAiError } from '../lib/ai';

interface GenOptions {
  tag?: string;
  force?: boolean;
}

export const genCommand = new Command('gen')
  .description('Generate a cheatsheet with Claude AI (requires ANTHROPIC_API_KEY)')
  .argument('<name>', 'Name of the cheatsheet')
  .argument('<topic...>', 'Topic to generate a cheatsheet about (e.g. "jq basics")')
  .option('-t, --tag <tags>', 'Comma-separated tags (e.g. --tag git,vcs)')
  .option('--force', 'Overwrite existing sheet')
  .action(async (name: string, topicWords: string[], options: GenOptions) => {
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
      console.error(
        chalk.red(`Error: Sheet "${name}" already exists. Use --force to overwrite`)
      );
      process.exit(1);
    }
    if (existingSheet?.type === 'image') {
      console.error(chalk.red(`Error: Sheet "${name}" is an image sheet and cannot be overwritten with generated text`));
      process.exit(1);
    }

    // タグ未指定で上書きする場合は既存のタグを引き継ぐ
    if (!tags && existingSheet?.tags) {
      tags = existingSheet.tags;
    }

    const topic = topicWords.join(' ');
    console.log(chalk.gray(`Generating "${name}" with Claude (${AI_MODEL})... this may take a moment`));

    try {
      const content = await generateCheatsheet(topic);

      const filename = `${name}.md`;
      const destPath = path.join(SHEETS_DIR, filename);
      await fs.writeFile(destPath, `${content}\n`, 'utf-8');

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

      console.log(chalk.green(`Generated cheatsheet "${name}"`));
      console.log(chalk.gray(`Run \`cs show ${name}\` to view it`));
    } catch (error) {
      console.error(chalk.red(`Error: ${formatAiError(error)}`));
      process.exit(1);
    }
  });
