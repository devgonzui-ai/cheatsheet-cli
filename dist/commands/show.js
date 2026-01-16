"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const open_1 = __importDefault(require("open"));
const storage_1 = require("../lib/storage");
const markdown_1 = require("../lib/markdown");
exports.showCommand = new commander_1.Command('show')
    .description('チートシートの内容を表示')
    .argument('<name>', 'チートシートの名前')
    .addOption(new commander_1.Option('-o, --open', '外部ビューアで開く（画像の場合）').hideHelp())
    .option('-r, --raw', '生のMarkdownを表示')
    .action(async (name, options) => {
    try {
        const sheet = await (0, storage_1.getSheet)(name);
        if (!sheet) {
            console.error(chalk_1.default.red(`エラー: シート "${name}" が見つかりません`));
            process.exit(1);
        }
        if (sheet.type === 'text') {
            const content = await (0, storage_1.readSheetContent)(sheet);
            if (options.raw) {
                console.log(content);
            }
            else {
                console.log((0, markdown_1.renderMarkdown)(content));
            }
        }
        else {
            const filePath = (0, storage_1.getSheetFilePath)(sheet);
            console.log(chalk_1.default.cyan(`画像ファイル: ${filePath}`));
            if (options.open) {
                await (0, open_1.default)(filePath);
                console.log(chalk_1.default.green('外部ビューアで開きました'));
            }
            else {
                console.log(chalk_1.default.gray('--open オプションで外部ビューアで開けます'));
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`エラー: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=show.js.map