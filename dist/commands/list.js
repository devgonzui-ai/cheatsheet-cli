"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const storage_1 = require("../lib/storage");
exports.listCommand = new commander_1.Command('list')
    .description('チートシート一覧を表示')
    .action(async () => {
    try {
        const sheets = await (0, storage_1.getAllSheets)();
        if (sheets.length === 0) {
            console.log(chalk_1.default.yellow('チートシートがありません'));
            return;
        }
        // 更新日時でソート（新しい順）
        sheets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.cyan('名前'),
                chalk_1.default.cyan('種類'),
                chalk_1.default.cyan('更新日時'),
            ],
            colWidths: [30, 10, 25],
        });
        for (const sheet of sheets) {
            const typeLabel = sheet.type === 'text' ? 'テキスト' : '画像';
            const updatedAt = new Date(sheet.updatedAt).toLocaleString('ja-JP');
            table.push([sheet.name, typeLabel, updatedAt]);
        }
        console.log(table.toString());
    }
    catch (error) {
        console.error(chalk_1.default.red(`エラー: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=list.js.map