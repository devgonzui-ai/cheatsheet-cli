"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const storage_1 = require("../lib/storage");
const tags_1 = require("../lib/tags");
const config_1 = require("../lib/config");
const ai_1 = require("../lib/ai");
exports.genCommand = new commander_1.Command('gen')
    .description('Generate a cheatsheet with Claude AI (requires ANTHROPIC_API_KEY)')
    .argument('<name>', 'Name of the cheatsheet')
    .argument('<topic...>', 'Topic to generate a cheatsheet about (e.g. "jq basics")')
    .option('-t, --tag <tags>', 'Comma-separated tags (e.g. --tag git,vcs)')
    .option('--force', 'Overwrite existing sheet')
    .action(async (name, topicWords, options) => {
    // 名前のバリデーション
    if (!(0, storage_1.validateName)(name)) {
        console.error(chalk_1.default.red('Error: Name can only contain alphanumeric characters, hyphens, and underscores'));
        process.exit(1);
    }
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
    // 既存シートのチェック
    const existingSheet = await (0, storage_1.getSheet)(name);
    if (existingSheet && !options.force) {
        console.error(chalk_1.default.red(`Error: Sheet "${name}" already exists. Use --force to overwrite`));
        process.exit(1);
    }
    if (existingSheet?.type === 'image') {
        console.error(chalk_1.default.red(`Error: Sheet "${name}" is an image sheet and cannot be overwritten with generated text`));
        process.exit(1);
    }
    // タグ未指定で上書きする場合は既存のタグを引き継ぐ
    if (!tags && existingSheet?.tags) {
        tags = existingSheet.tags;
    }
    const topic = topicWords.join(' ');
    console.log(chalk_1.default.gray(`Generating "${name}" with Claude (${ai_1.AI_MODEL})... this may take a moment`));
    try {
        const content = await (0, ai_1.generateCheatsheet)(topic);
        const filename = `${name}.md`;
        const destPath = path_1.default.join(config_1.SHEETS_DIR, filename);
        await fs_extra_1.default.writeFile(destPath, `${content}\n`, 'utf-8');
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
        console.log(chalk_1.default.green(`Generated cheatsheet "${name}"`));
        console.log(chalk_1.default.gray(`Run \`cs show ${name}\` to view it`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${(0, ai_1.formatAiError)(error)}`));
        process.exit(1);
    }
});
//# sourceMappingURL=gen.js.map