import { Command } from 'commander';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { showCommand } from './commands/show';
import { searchCommand } from './commands/search';
import { editCommand } from './commands/edit';
import { removeCommand } from './commands/remove';
import { exportCommand } from './commands/export';
import { initStorage } from './lib/storage';

const program = new Command();

program
  .name('cs')
  .description('コマンドやツールのチートシートをローカルに保存・管理するCLIツール')
  .version('1.0.0');

// コマンドを登録
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(searchCommand);
program.addCommand(editCommand);
program.addCommand(removeCommand);
program.addCommand(exportCommand);

// メイン処理
const main = async () => {
  // ストレージを初期化
  await initStorage();

  // コマンドをパース
  program.parse(process.argv);
};

main().catch((error) => {
  console.error('予期しないエラーが発生しました:', error.message);
  process.exit(1);
});
