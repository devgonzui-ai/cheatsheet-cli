"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const readline_1 = __importDefault(require("readline"));
const storage_1 = require("../lib/storage");
const tags_1 = require("../lib/tags");
const config_1 = require("../lib/config");
const markdown_1 = require("../lib/markdown");
const cheatsh_1 = require("../lib/cheatsh");
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
exports.fetchCommand = new commander_1.Command('fetch')
    .description('Fetch a cheatsheet from cheat.sh (e.g. `cs fetch tar`)')
    .argument('<topic>', 'Topic on cheat.sh (e.g. tar, python/lists)')
    .option('-s, --save [name]', 'Save locally (defaults to a name derived from the topic)')
    .option('-t, --tag <tags>', 'Comma-separated tags (implies --save)')
    .option('--force', 'Overwrite existing sheet without confirmation')
    .option('-r, --raw', 'Print raw Markdown instead of rendering it')
    .action(async (topic, options) => {
    // --tag だけ指定されたときも保存する意図とみなす
    const shouldSave = options.save !== undefined || options.tag !== undefined;
    // タグのパースとバリデーション
    let tags;
    if (options.tag) {
        tags = (0, tags_1.parseTags)(options.tag);
        const invalidTags = (0, tags_1.validateTags)(tags);
        if (invalidTags.length > 0) {
            console.error(chalk_1.default.red(`Error: Invalid tag(s): ${invalidTags.join(', ')} (only alphanumeric characters, hyphens, and underscores are allowed)`));
            process.exit(1);
        }
    }
    // 保存名: --save <name> が明示されていればそれ、なければトピックから生成
    const name = typeof options.save === 'string' ? options.save : (0, cheatsh_1.topicToSheetName)(topic);
    if (shouldSave && !(0, storage_1.validateName)(name)) {
        console.error(chalk_1.default.red(`Error: "${name}" is not a valid sheet name. Pass one explicitly with --save <name>`));
        process.exit(1);
    }
    try {
        // 保存する場合は取得前に上書き確認を済ませる
        let existingSheet;
        if (shouldSave) {
            existingSheet = await (0, storage_1.getSheet)(name);
            if (existingSheet && !options.force) {
                if (!process.stdin.isTTY) {
                    console.error(chalk_1.default.red(`Error: Sheet "${name}" already exists. Use --force to overwrite`));
                    process.exit(1);
                }
                const shouldOverwrite = await confirmOverwrite(name);
                if (!shouldOverwrite) {
                    console.log(chalk_1.default.yellow('Cancelled'));
                    return;
                }
            }
        }
        const content = await (0, cheatsh_1.fetchCheatSheet)(topic);
        const markdown = (0, cheatsh_1.toMarkdown)(topic, content);
        if (!shouldSave) {
            console.log(options.raw ? markdown : (0, markdown_1.renderMarkdown)(markdown));
            console.log(chalk_1.default.gray(`Use --save to keep this locally (cs fetch ${topic} --save)`));
            return;
        }
        // タグ未指定で上書きする場合は既存のタグを引き継ぐ
        if (!tags && existingSheet?.tags) {
            tags = existingSheet.tags;
        }
        const filename = `${name}.md`;
        await fs_extra_1.default.writeFile(path_1.default.join(config_1.SHEETS_DIR, filename), markdown, 'utf-8');
        const now = new Date().toISOString();
        const sheet = {
            name,
            type: 'text',
            filename,
            tags,
            createdAt: existingSheet?.createdAt || now,
            updatedAt: now,
        };
        await (0, storage_1.addOrUpdateSheet)(sheet);
        console.log(chalk_1.default.green(`Saved "${name}" from cheat.sh/${topic}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=fetch.js.map