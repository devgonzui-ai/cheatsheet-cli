"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const storage_1 = require("../lib/storage");
// 削除確認プロンプト
const confirmDelete = async (name) => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(chalk_1.default.yellow(`シート "${name}" を削除しますか？ (y/N): `), (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
};
exports.removeCommand = new commander_1.Command('rm')
    .description('チートシートを削除')
    .argument('<name>', 'チートシートの名前')
    .option('-f, --force', '確認をスキップ')
    .action(async (name, options) => {
    try {
        const sheet = await (0, storage_1.getSheet)(name);
        if (!sheet) {
            console.error(chalk_1.default.red(`エラー: シート "${name}" が見つかりません`));
            process.exit(1);
        }
        if (!options.force) {
            const shouldDelete = await confirmDelete(name);
            if (!shouldDelete) {
                console.log(chalk_1.default.yellow('キャンセルしました'));
                return;
            }
        }
        await (0, storage_1.removeSheet)(name);
        console.log(chalk_1.default.green(`シート "${name}" を削除しました`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`エラー: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=remove.js.map