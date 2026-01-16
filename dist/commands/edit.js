"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const storage_1 = require("../lib/storage");
const config_1 = require("../lib/config");
// エディタを起動してテキストを編集
const openEditor = (filePath) => {
    return new Promise((resolve, reject) => {
        const editor = (0, config_1.getEditor)();
        const child = (0, child_process_1.spawn)(editor, [filePath], {
            stdio: 'inherit',
        });
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`エディタが終了コード ${code} で終了しました`));
            }
        });
        child.on('error', (err) => {
            reject(err);
        });
    });
};
exports.editCommand = new commander_1.Command('edit')
    .description('チートシートを編集（テキストのみ）')
    .argument('<name>', 'チートシートの名前')
    .action(async (name) => {
    try {
        const sheet = await (0, storage_1.getSheet)(name);
        if (!sheet) {
            console.error(chalk_1.default.red(`エラー: シート "${name}" が見つかりません`));
            process.exit(1);
        }
        if (sheet.type !== 'text') {
            console.error(chalk_1.default.red('エラー: 画像シートは編集できません'));
            process.exit(1);
        }
        const filePath = (0, storage_1.getSheetFilePath)(sheet);
        await openEditor(filePath);
        // 更新日時を更新
        sheet.updatedAt = new Date().toISOString();
        await (0, storage_1.addOrUpdateSheet)(sheet);
        console.log(chalk_1.default.green(`シート "${name}" を更新しました`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`エラー: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=edit.js.map