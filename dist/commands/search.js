"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../lib/storage");
exports.searchCommand = new commander_1.Command('search')
    .description('チートシートをキーワード検索')
    .argument('<keyword>', '検索キーワード')
    .action(async (keyword) => {
    try {
        const sheets = await (0, storage_1.getAllSheets)();
        const lowerKeyword = keyword.toLowerCase();
        const results = [];
        for (const sheet of sheets) {
            // 名前で検索
            if (sheet.name.toLowerCase().includes(lowerKeyword)) {
                results.push({
                    name: sheet.name,
                    type: sheet.type === 'text' ? 'テキスト' : '画像',
                    matchType: '名前',
                });
                continue;
            }
            // テキストシートの場合は内容も検索
            if (sheet.type === 'text') {
                const content = await (0, storage_1.readSheetContent)(sheet);
                if (content.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        name: sheet.name,
                        type: 'テキスト',
                        matchType: '内容',
                    });
                }
            }
        }
        if (results.length === 0) {
            console.log(chalk_1.default.yellow(`"${keyword}" に一致するシートが見つかりませんでした`));
            return;
        }
        console.log(chalk_1.default.green(`${results.length} 件見つかりました:\n`));
        for (const result of results) {
            console.log(`  ${chalk_1.default.cyan(result.name)} (${result.type}) - ${chalk_1.default.gray(result.matchType + 'で一致')}`);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`エラー: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=search.js.map