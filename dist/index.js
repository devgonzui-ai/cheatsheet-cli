"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const add_1 = require("./commands/add");
const gen_1 = require("./commands/gen");
const refine_1 = require("./commands/refine");
const list_1 = require("./commands/list");
const show_1 = require("./commands/show");
const search_1 = require("./commands/search");
const copy_1 = require("./commands/copy");
const mcp_1 = require("./commands/mcp");
const edit_1 = require("./commands/edit");
const remove_1 = require("./commands/remove");
const rename_1 = require("./commands/rename");
const export_1 = require("./commands/export");
const interactive_1 = require("./commands/interactive");
const storage_1 = require("./lib/storage");
const program = new commander_1.Command();
program
    .name('cs')
    .description('A CLI tool to save and manage cheatsheets for commands and tools locally')
    .version('1.4.0');
// 引数なしで実行したらインタラクティブ選択モード（TTYのみ）
program.action(async () => {
    if (process.stdin.isTTY && process.stdout.isTTY) {
        await (0, interactive_1.runInteractive)();
    }
    else {
        program.help();
    }
});
// コマンドを登録
program.addCommand(add_1.addCommand);
program.addCommand(gen_1.genCommand);
program.addCommand(refine_1.refineCommand);
program.addCommand(list_1.listCommand);
program.addCommand(show_1.showCommand);
program.addCommand(search_1.searchCommand);
program.addCommand(copy_1.copyCommand);
program.addCommand(mcp_1.mcpCommand);
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