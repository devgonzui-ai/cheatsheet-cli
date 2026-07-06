"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInteractive = exports.filterSheets = void 0;
const chalk_1 = __importDefault(require("chalk"));
const search_1 = __importDefault(require("@inquirer/search"));
const storage_1 = require("../lib/storage");
const markdown_1 = require("../lib/markdown");
const search_2 = require("../lib/search");
const tags_1 = require("../lib/tags");
// 入力にマッチするシートを絞り込む（部分一致優先、次にfuzzy）
const filterSheets = (sheets, input) => {
    const keyword = input.trim();
    if (keyword === '') {
        return sheets;
    }
    const lowerKeyword = keyword.toLowerCase();
    const substringMatches = sheets.filter((s) => s.name.toLowerCase().includes(lowerKeyword));
    const fuzzyMatches = sheets.filter((s) => !s.name.toLowerCase().includes(lowerKeyword) && (0, search_2.fuzzyMatch)(s.name, keyword));
    return [...substringMatches, ...fuzzyMatches];
};
exports.filterSheets = filterSheets;
// 引数なしで `cs` を実行したときのインクリメンタル検索モード
const runInteractive = async () => {
    const sheets = await (0, storage_1.getAllSheets)();
    if (sheets.length === 0) {
        console.log(chalk_1.default.yellow('No cheatsheets found. Add one with `cs add <name>`'));
        return;
    }
    let selectedName;
    try {
        selectedName = await (0, search_1.default)({
            message: 'Select a cheatsheet (type to filter):',
            source: async (input) => {
                return (0, exports.filterSheets)(sheets, input || '').map((sheet) => ({
                    name: sheet.tags?.length ? `${sheet.name}  [${(0, tags_1.formatTags)(sheet.tags)}]` : sheet.name,
                    value: sheet.name,
                }));
            },
        });
    }
    catch (error) {
        // Ctrl+C での中断は静かに終了
        if (error.name === 'ExitPromptError') {
            return;
        }
        throw error;
    }
    const sheet = sheets.find((s) => s.name === selectedName);
    if (!sheet) {
        return;
    }
    if (sheet.type === 'text') {
        const content = await (0, storage_1.readSheetContent)(sheet);
        console.log((0, markdown_1.renderMarkdown)(content));
    }
    else {
        console.log(chalk_1.default.cyan(`Image file: ${(0, storage_1.getSheetFilePath)(sheet)}`));
        console.log(chalk_1.default.gray(`Use \`cs show ${sheet.name} --open\` to open with external viewer`));
    }
};
exports.runInteractive = runInteractive;
//# sourceMappingURL=interactive.js.map