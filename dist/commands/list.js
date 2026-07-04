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
const tags_1 = require("../lib/tags");
exports.listCommand = new commander_1.Command('list')
    .description('List all cheatsheets')
    .option('-t, --tag <tag>', 'Filter by tag')
    .action(async (options) => {
    try {
        let sheets = await (0, storage_1.getAllSheets)();
        // タグで絞り込み
        if (options.tag) {
            sheets = sheets.filter((sheet) => (0, tags_1.matchByTag)(sheet, options.tag));
        }
        if (sheets.length === 0) {
            if (options.tag) {
                console.log(chalk_1.default.yellow(`No cheatsheets found with tag "${options.tag}"`));
            }
            else {
                console.log(chalk_1.default.yellow('No cheatsheets found'));
            }
            return;
        }
        // 更新日時でソート（新しい順）
        sheets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.cyan('Name'),
                chalk_1.default.cyan('Type'),
                chalk_1.default.cyan('Tags'),
                chalk_1.default.cyan('Updated'),
            ],
            colWidths: [30, 10, 20, 25],
        });
        for (const sheet of sheets) {
            const typeLabel = sheet.type === 'text' ? 'Text' : 'Image';
            const updatedAt = new Date(sheet.updatedAt).toLocaleString('en-US');
            table.push([sheet.name, typeLabel, (0, tags_1.formatTags)(sheet.tags), updatedAt]);
        }
        console.log(table.toString());
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=list.js.map