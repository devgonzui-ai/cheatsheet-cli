"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const clipboardy_1 = __importDefault(require("clipboardy"));
const storage_1 = require("../lib/storage");
const markdown_1 = require("../lib/markdown");
// 番号選択プロンプト
const promptBlockIndex = async (max) => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(chalk_1.default.yellow(`Which block do you want to copy? (1-${max}): `), (answer) => {
            rl.close();
            const num = parseInt(answer.trim(), 10);
            if (isNaN(num) || num < 1 || num > max) {
                resolve(undefined);
            }
            else {
                resolve(num);
            }
        });
    });
};
// コードブロックのプレビューを表示
const printBlockList = (blocks) => {
    blocks.forEach((block, i) => {
        const langLabel = block.lang ? chalk_1.default.blue(`[${block.lang}]`) : chalk_1.default.gray('[text]');
        console.log(chalk_1.default.bold(`  ${i + 1}.`) + ` ${langLabel}`);
        const lines = block.code.split('\n');
        const preview = lines.slice(0, 3);
        for (const line of preview) {
            console.log(chalk_1.default.gray('     ') + line);
        }
        if (lines.length > 3) {
            console.log(chalk_1.default.gray(`     ... (${lines.length - 3} more line(s))`));
        }
        console.log();
    });
};
exports.copyCommand = new commander_1.Command('copy')
    .description('Copy a code block from a cheatsheet to the clipboard')
    .argument('<name>', 'Name of the cheatsheet')
    .argument('[index]', 'Code block number to copy (1-based)')
    .option('-a, --all', 'Copy the entire sheet content')
    .action(async (name, indexArg, options) => {
    try {
        const sheet = await (0, storage_1.getSheet)(name);
        if (!sheet) {
            console.error(chalk_1.default.red(`Error: Sheet "${name}" not found`));
            process.exit(1);
        }
        if (sheet.type === 'image') {
            console.error(chalk_1.default.red('Error: Cannot copy image sheets to the clipboard'));
            process.exit(1);
        }
        const content = await (0, storage_1.readSheetContent)(sheet);
        // シート全体をコピー
        if (options.all) {
            await clipboardy_1.default.write(content);
            console.log(chalk_1.default.green(`Copied entire sheet "${name}" to the clipboard`));
            return;
        }
        const blocks = (0, markdown_1.extractCodeBlocks)(content);
        // コードブロックがない場合はシート全体をコピー
        if (blocks.length === 0) {
            await clipboardy_1.default.write(content);
            console.log(chalk_1.default.green(`No code blocks found. Copied entire sheet "${name}" to the clipboard`));
            return;
        }
        // 番号指定あり
        if (indexArg !== undefined) {
            const index = parseInt(indexArg, 10);
            if (isNaN(index) || index < 1 || index > blocks.length) {
                console.error(chalk_1.default.red(`Error: Invalid block number "${indexArg}" (available: 1-${blocks.length})`));
                process.exit(1);
            }
            await clipboardy_1.default.write(blocks[index - 1].code);
            console.log(chalk_1.default.green(`Copied code block #${index} to the clipboard`));
            return;
        }
        // ブロックが1つなら即コピー
        if (blocks.length === 1) {
            await clipboardy_1.default.write(blocks[0].code);
            console.log(chalk_1.default.green('Copied code block to the clipboard'));
            return;
        }
        // 複数ブロックは一覧表示して選択
        console.log(chalk_1.default.bold(`Found ${blocks.length} code blocks in "${name}":\n`));
        printBlockList(blocks);
        const selected = await promptBlockIndex(blocks.length);
        if (selected === undefined) {
            console.log(chalk_1.default.yellow('Cancelled'));
            return;
        }
        await clipboardy_1.default.write(blocks[selected - 1].code);
        console.log(chalk_1.default.green(`Copied code block #${selected} to the clipboard`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=copy.js.map