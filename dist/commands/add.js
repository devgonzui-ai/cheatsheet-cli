"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const readline_1 = __importDefault(require("readline"));
const storage_1 = require("../lib/storage");
const config_1 = require("../lib/config");
// 上書き確認プロンプト
const confirmOverwrite = async (name) => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(chalk_1.default.yellow(`シート "${name}" は既に存在します。上書きしますか？ (y/N): `), (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
};
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
exports.addCommand = new commander_1.Command('add')
    .description('チートシートを追加')
    .argument('<name>', 'チートシートの名前')
    .option('-f, --file <path>', '既存ファイルから追加')
    .addOption(new commander_1.Option('-i, --image <path>', '画像ファイルを追加').hideHelp())
    .action(async (name, options) => {
    // 名前のバリデーション
    if (!(0, storage_1.validateName)(name)) {
        console.error(chalk_1.default.red('エラー: 名前には英数字、ハイフン、アンダースコアのみ使用できます'));
        process.exit(1);
    }
    // 既存シートのチェック
    const existingSheet = await (0, storage_1.getSheet)(name);
    if (existingSheet) {
        const shouldOverwrite = await confirmOverwrite(name);
        if (!shouldOverwrite) {
            console.log(chalk_1.default.yellow('キャンセルしました'));
            return;
        }
    }
    const now = new Date().toISOString();
    try {
        if (options.image) {
            // 画像ファイルから追加
            const imagePath = path_1.default.resolve(options.image);
            if (!(await fs_extra_1.default.pathExists(imagePath))) {
                console.error(chalk_1.default.red(`エラー: ファイルが見つかりません: ${imagePath}`));
                process.exit(1);
            }
            if (!(0, storage_1.isValidImageExtension)(imagePath)) {
                console.error(chalk_1.default.red('エラー: サポートされていない画像形式です (png, jpg, jpeg, gif, webp, svg)'));
                process.exit(1);
            }
            const ext = path_1.default.extname(imagePath);
            const filename = `${name}${ext}`;
            const destPath = path_1.default.join(config_1.IMAGES_DIR, filename);
            await (0, storage_1.copyFile)(imagePath, destPath);
            const sheet = {
                name,
                type: 'image',
                filename,
                createdAt: existingSheet?.createdAt || now,
                updatedAt: now,
            };
            await (0, storage_1.addOrUpdateSheet)(sheet);
            console.log(chalk_1.default.green(`画像シート "${name}" を追加しました`));
        }
        else if (options.file) {
            // 既存テキストファイルから追加
            const filePath = path_1.default.resolve(options.file);
            if (!(await fs_extra_1.default.pathExists(filePath))) {
                console.error(chalk_1.default.red(`エラー: ファイルが見つかりません: ${filePath}`));
                process.exit(1);
            }
            const content = await fs_extra_1.default.readFile(filePath, 'utf-8');
            const filename = `${name}.md`;
            const destPath = path_1.default.join(config_1.SHEETS_DIR, filename);
            await fs_extra_1.default.writeFile(destPath, content, 'utf-8');
            const sheet = {
                name,
                type: 'text',
                filename,
                createdAt: existingSheet?.createdAt || now,
                updatedAt: now,
            };
            await (0, storage_1.addOrUpdateSheet)(sheet);
            console.log(chalk_1.default.green(`テキストシート "${name}" を追加しました`));
        }
        else {
            // エディタで新規作成
            const filename = `${name}.md`;
            const filePath = path_1.default.join(config_1.SHEETS_DIR, filename);
            // 既存のファイルがない場合は空ファイルを作成
            if (!(await fs_extra_1.default.pathExists(filePath))) {
                await fs_extra_1.default.writeFile(filePath, '', 'utf-8');
            }
            await openEditor(filePath);
            // エディタ終了後、ファイルが空でないかチェック
            const content = await fs_extra_1.default.readFile(filePath, 'utf-8');
            if (content.trim() === '') {
                await fs_extra_1.default.remove(filePath);
                console.log(chalk_1.default.yellow('内容が空のためキャンセルしました'));
                return;
            }
            const sheet = {
                name,
                type: 'text',
                filename,
                createdAt: existingSheet?.createdAt || now,
                updatedAt: now,
            };
            await (0, storage_1.addOrUpdateSheet)(sheet);
            console.log(chalk_1.default.green(`テキストシート "${name}" を追加しました`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`エラー: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=add.js.map