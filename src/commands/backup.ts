import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import { CONFIG_DIR } from '../lib/config';
import {
  createBackup,
  restoreBackup,
  resolveBackupPath,
  hasExistingData,
  countSheets,
} from '../lib/backup';

export const backupCommand = new Command('backup')
  .description('Back up all cheatsheets to a tar.gz archive')
  .option('-o, --out <path>', 'Output file or directory (default: ./cheatsheet-backup-<timestamp>.tar.gz)')
  .action(async (options: { out?: string }) => {
    try {
      const file = resolveBackupPath(options.out, process.cwd());
      await createBackup(file);
      const total = await countSheets();
      console.log(chalk.green(`Backed up ${total} sheet(s) to ${file}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

export const restoreCommand = new Command('restore')
  .description('Restore cheatsheets from a backup archive')
  .argument('<file>', 'Backup file created by `cs backup`')
  .option('--force', 'Overwrite existing data without confirmation')
  .action(async (file: string, options: { force?: boolean }) => {
    try {
      if (!(await fs.pathExists(file))) {
        console.error(chalk.red(`Error: File not found: ${file}`));
        process.exit(1);
      }

      if ((await hasExistingData()) && !options.force) {
        console.error(
          chalk.red(
            `Error: Existing cheatsheets found in ${CONFIG_DIR}. Use --force to overwrite them with the backup`
          )
        );
        process.exit(1);
      }

      await restoreBackup(file);
      const total = await countSheets();
      console.log(chalk.green(`Restored ${total} sheet(s) from ${file}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });
