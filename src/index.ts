import { Command } from 'commander';
import { addCommand } from './commands/add';
import { genCommand } from './commands/gen';
import { refineCommand } from './commands/refine';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { searchCommand } from './commands/search';
import { copyCommand } from './commands/copy';
import { mcpCommand } from './commands/mcp';
import { editCommand } from './commands/edit';
import { removeCommand } from './commands/remove';
import { renameCommand } from './commands/rename';
import { exportCommand } from './commands/export';
import { configCommand } from './commands/config';
import { completionCommand, namesCommand } from './commands/completion';
import { runInteractive } from './commands/interactive';
import { initStorage } from './lib/storage';

const program = new Command();

program
  .name('cs')
  .description('A CLI tool to save and manage cheatsheets for commands and tools locally')
  .version('1.5.0');

// 引数なしで実行したらインタラクティブ選択モード（TTYのみ）
program.action(async () => {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    await runInteractive();
  } else {
    program.help();
  }
});

// コマンドを登録
program.addCommand(addCommand);
program.addCommand(genCommand);
program.addCommand(refineCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(searchCommand);
program.addCommand(copyCommand);
program.addCommand(mcpCommand);
program.addCommand(editCommand);
program.addCommand(removeCommand);
program.addCommand(renameCommand);
program.addCommand(exportCommand);
program.addCommand(configCommand);
program.addCommand(completionCommand);
program.addCommand(namesCommand, { hidden: true });

// メイン処理
const main = async () => {
  // ストレージを初期化
  await initStorage();

  // コマンドをパース
  program.parse(process.argv);
};

main().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});
