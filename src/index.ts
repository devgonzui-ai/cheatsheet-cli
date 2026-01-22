import { Command } from 'commander';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { searchCommand } from './commands/search';
import { editCommand } from './commands/edit';
import { removeCommand } from './commands/remove';
import { renameCommand } from './commands/rename';
import { exportCommand } from './commands/export';
import { initStorage } from './lib/storage';

const program = new Command();

program
  .name('cs')
  .description('A CLI tool to save and manage cheatsheets for commands and tools locally')
  .version('1.0.0');

// コマンドを登録
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(searchCommand);
program.addCommand(editCommand);
program.addCommand(removeCommand);
program.addCommand(renameCommand);
program.addCommand(exportCommand);

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
