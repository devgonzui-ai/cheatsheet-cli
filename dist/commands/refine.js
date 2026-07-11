"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refineCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const storage_1 = require("../lib/storage");
const ai_1 = require("../lib/ai");
exports.refineCommand = new commander_1.Command('refine')
    .description('Restructure a cheatsheet into clean Markdown with Claude AI (requires ANTHROPIC_API_KEY)')
    .argument('<name>', 'Name of the cheatsheet')
    .option('--dry-run', 'Print the refined content without saving')
    .action(async (name, options) => {
    const sheet = await (0, storage_1.getSheet)(name);
    if (!sheet) {
        console.error(chalk_1.default.red(`Error: Sheet "${name}" not found`));
        process.exit(1);
    }
    if (sheet.type !== 'text') {
        console.error(chalk_1.default.red(`Error: Sheet "${name}" is an image sheet and cannot be refined`));
        process.exit(1);
    }
    const content = await (0, storage_1.readSheetContent)(sheet);
    if (content.trim() === '') {
        console.error(chalk_1.default.red(`Error: Sheet "${name}" is empty`));
        process.exit(1);
    }
    console.log(chalk_1.default.gray(`Refining "${name}" with Claude (${ai_1.AI_MODEL})... this may take a moment`));
    try {
        const refined = await (0, ai_1.refineCheatsheet)(content);
        if (options.dryRun) {
            console.log(refined);
            console.log(chalk_1.default.yellow('\n(dry run: nothing was saved)'));
            return;
        }
        await (0, storage_1.writeSheetContent)(sheet, `${refined}\n`);
        sheet.updatedAt = new Date().toISOString();
        await (0, storage_1.addOrUpdateSheet)(sheet);
        console.log(chalk_1.default.green(`Refined cheatsheet "${name}"`));
        console.log(chalk_1.default.gray(`Run \`cs show ${name}\` to view it`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${(0, ai_1.formatAiError)(error)}`));
        process.exit(1);
    }
});
//# sourceMappingURL=refine.js.map