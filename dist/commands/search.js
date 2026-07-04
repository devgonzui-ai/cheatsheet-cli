"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../lib/storage");
const tags_1 = require("../lib/tags");
exports.searchCommand = new commander_1.Command('search')
    .description('Search cheatsheets by keyword and/or tag')
    .argument('[keyword]', 'Search keyword')
    .option('-t, --tag <tag>', 'Filter by tag')
    .action(async (keyword, options) => {
    if (!keyword && !options.tag) {
        console.error(chalk_1.default.red('Error: Specify a keyword and/or --tag <tag>'));
        process.exit(1);
    }
    try {
        let sheets = await (0, storage_1.getAllSheets)();
        const results = [];
        // タグで絞り込み
        if (options.tag) {
            sheets = sheets.filter((sheet) => (0, tags_1.matchByTag)(sheet, options.tag));
        }
        if (!keyword) {
            // タグのみの検索
            for (const sheet of sheets) {
                results.push({
                    name: sheet.name,
                    type: sheet.type === 'text' ? 'Text' : 'Image',
                    matchType: 'tag',
                });
            }
        }
        else {
            const lowerKeyword = keyword.toLowerCase();
            for (const sheet of sheets) {
                // 名前で検索
                if (sheet.name.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        name: sheet.name,
                        type: sheet.type === 'text' ? 'Text' : 'Image',
                        matchType: 'name',
                    });
                    continue;
                }
                // テキストシートの場合は内容も検索
                if (sheet.type === 'text') {
                    const content = await (0, storage_1.readSheetContent)(sheet);
                    if (content.toLowerCase().includes(lowerKeyword)) {
                        results.push({
                            name: sheet.name,
                            type: 'Text',
                            matchType: 'content',
                        });
                    }
                }
            }
        }
        if (results.length === 0) {
            const criteria = [
                keyword ? `"${keyword}"` : '',
                options.tag ? `tag "${options.tag}"` : '',
            ]
                .filter(Boolean)
                .join(' with ');
            console.log(chalk_1.default.yellow(`No sheets found matching ${criteria}`));
            return;
        }
        console.log(chalk_1.default.green(`Found ${results.length} result(s):\n`));
        for (const result of results) {
            console.log(`  ${chalk_1.default.cyan(result.name)} (${result.type}) - ${chalk_1.default.gray('matched by ' + result.matchType)}`);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=search.js.map