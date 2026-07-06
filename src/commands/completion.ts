import { Command } from 'commander';
import chalk from 'chalk';
import { getCompletionScript, SUPPORTED_SHELLS } from '../lib/completion';
import { getAllSheets } from '../lib/storage';

export const completionCommand = new Command('completion')
  .description(`Output shell completion script (${SUPPORTED_SHELLS.join(' | ')})`)
  .argument('<shell>', `Target shell: ${SUPPORTED_SHELLS.join(' | ')}`)
  .action((shell: string) => {
    const script = getCompletionScript(shell);
    if (!script) {
      console.error(
        chalk.red(`Error: Unsupported shell "${shell}" (supported: ${SUPPORTED_SHELLS.join(', ')})`)
      );
      process.exit(1);
    }
    console.log(script);
  });

// 補完スクリプトから呼ばれる隠しコマンド: シート名を1行1件で出力
export const namesCommand = new Command('_names').action(async () => {
  const sheets = await getAllSheets();
  for (const sheet of sheets) {
    console.log(sheet.name);
  }
});
