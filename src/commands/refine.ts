import { Command } from 'commander';
import chalk from 'chalk';
import { getSheet, addOrUpdateSheet, readSheetContent, writeSheetContent } from '../lib/storage';
import { AI_MODEL, refineCheatsheet, formatAiError } from '../lib/ai';

interface RefineOptions {
  dryRun?: boolean;
}

export const refineCommand = new Command('refine')
  .description('Restructure a cheatsheet into clean Markdown with Claude AI (requires ANTHROPIC_API_KEY)')
  .argument('<name>', 'Name of the cheatsheet')
  .option('--dry-run', 'Print the refined content without saving')
  .action(async (name: string, options: RefineOptions) => {
    const sheet = await getSheet(name);
    if (!sheet) {
      console.error(chalk.red(`Error: Sheet "${name}" not found`));
      process.exit(1);
    }
    if (sheet.type !== 'text') {
      console.error(chalk.red(`Error: Sheet "${name}" is an image sheet and cannot be refined`));
      process.exit(1);
    }

    const content = await readSheetContent(sheet);
    if (content.trim() === '') {
      console.error(chalk.red(`Error: Sheet "${name}" is empty`));
      process.exit(1);
    }

    console.log(chalk.gray(`Refining "${name}" with Claude (${AI_MODEL})... this may take a moment`));

    try {
      const refined = await refineCheatsheet(content);

      if (options.dryRun) {
        console.log(refined);
        console.log(chalk.yellow('\n(dry run: nothing was saved)'));
        return;
      }

      await writeSheetContent(sheet, `${refined}\n`);
      sheet.updatedAt = new Date().toISOString();
      await addOrUpdateSheet(sheet);

      console.log(chalk.green(`Refined cheatsheet "${name}"`));
      console.log(chalk.gray(`Run \`cs show ${name}\` to view it`));
    } catch (error) {
      console.error(chalk.red(`Error: ${formatAiError(error)}`));
      process.exit(1);
    }
  });
