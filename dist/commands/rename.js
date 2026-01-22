"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const storage_1 = require("../lib/storage");
// 上書き確認プロンプト
const confirmOverwrite = async (name) => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(chalk_1.default.yellow(`Sheet "${name}" already exists. Overwrite? (y/N): `), (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
};
exports.renameCommand = new commander_1.Command('rename')
    .description('Rename a cheatsheet')
    .argument('<old-name>', 'Current name of the cheatsheet')
    .argument('<new-name>', 'New name for the cheatsheet')
    .option('-f, --force', 'Overwrite if new name exists')
    .action(async (oldName, newName, options) => {
    try {
        // 同じ名前の場合
        if (oldName === newName) {
            console.error(chalk_1.default.red('Error: Old name and new name are the same'));
            process.exit(1);
        }
        // 新しい名前のバリデーション
        if (!(0, storage_1.validateName)(newName)) {
            console.error(chalk_1.default.red('Error: Invalid name. Use only alphanumeric characters, hyphens, and underscores'));
            process.exit(1);
        }
        // 古い名前のシートが存在するか確認
        const oldSheet = await (0, storage_1.getSheet)(oldName);
        if (!oldSheet) {
            console.error(chalk_1.default.red(`Error: Sheet "${oldName}" not found`));
            process.exit(1);
        }
        // 新しい名前のシートが既に存在するか確認
        const existingSheet = await (0, storage_1.getSheet)(newName);
        if (existingSheet) {
            if (!options.force) {
                const shouldOverwrite = await confirmOverwrite(newName);
                if (!shouldOverwrite) {
                    console.log(chalk_1.default.yellow('Cancelled'));
                    return;
                }
            }
            // 既存のシートを削除
            await (0, storage_1.removeSheet)(newName);
        }
        // リネーム実行
        const success = await (0, storage_1.renameSheet)(oldName, newName);
        if (success) {
            console.log(chalk_1.default.green(`Renamed "${oldName}" to "${newName}"`));
        }
        else {
            console.error(chalk_1.default.red(`Error: Failed to rename sheet`));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=rename.js.map