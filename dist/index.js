"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const add_1 = require("./commands/add");
const list_1 = require("./commands/list");
const show_1 = require("./commands/show");
const search_1 = require("./commands/search");
const edit_1 = require("./commands/edit");
const remove_1 = require("./commands/remove");
const rename_1 = require("./commands/rename");
const export_1 = require("./commands/export");
const storage_1 = require("./lib/storage");
const program = new commander_1.Command();
program
    .name('cs')
    .description('A CLI tool to save and manage cheatsheets for commands and tools locally')
    .version('1.0.0');
// コマンドを登録
program.addCommand(add_1.addCommand);
program.addCommand(list_1.listCommand);
program.addCommand(show_1.showCommand);
program.addCommand(search_1.searchCommand);
program.addCommand(edit_1.editCommand);
program.addCommand(remove_1.removeCommand);
program.addCommand(rename_1.renameCommand);
program.addCommand(export_1.exportCommand);
// メイン処理
const main = async () => {
    // ストレージを初期化
    await (0, storage_1.initStorage)();
    // コマンドをパース
    program.parse(process.argv);
};
main().catch((error) => {
    console.error('Unexpected error:', error.message);
    process.exit(1);
});
//# sourceMappingURL=index.js.map