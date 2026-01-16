import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { getSheet, getSheetFilePath } from '../lib/storage';

export const exportCommand = new Command('export')
  .description('チートシートをエクスポート')
  .argument('<name>', 'チートシートの名前')
  .option('-o, --out <path>', '出力先パス')
  .action(async (name: string, options: { out?: string }) => {
    try {
      const sheet = await getSheet(name);

      if (!sheet) {
        console.error(chalk.red(`エラー: シート "${name}" が見つかりません`));
        process.exit(1);
      }

      const srcPath = getSheetFilePath(sheet);
      const destDir = options.out ? path.resolve(options.out) : process.cwd();
      const destPath = path.join(destDir, sheet.filename);

      // 出力先ディレクトリが存在することを確認
      await fs.ensureDir(destDir);

      await fs.copy(srcPath, destPath);
      console.log(chalk.green(`エクスポートしました: ${destPath}`));
    } catch (error) {
      console.error(chalk.red(`エラー: ${(error as Error).message}`));
      process.exit(1);
    }
  });
