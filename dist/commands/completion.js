"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.namesCommand = exports.completionCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const completion_1 = require("../lib/completion");
const storage_1 = require("../lib/storage");
exports.completionCommand = new commander_1.Command('completion')
    .description(`Output shell completion script (${completion_1.SUPPORTED_SHELLS.join(' | ')})`)
    .argument('<shell>', `Target shell: ${completion_1.SUPPORTED_SHELLS.join(' | ')}`)
    .action((shell) => {
    const script = (0, completion_1.getCompletionScript)(shell);
    if (!script) {
        console.error(chalk_1.default.red(`Error: Unsupported shell "${shell}" (supported: ${completion_1.SUPPORTED_SHELLS.join(', ')})`));
        process.exit(1);
    }
    console.log(script);
});
// 補完スクリプトから呼ばれる隠しコマンド: シート名を1行1件で出力
exports.namesCommand = new commander_1.Command('_names').action(async () => {
    const sheets = await (0, storage_1.getAllSheets)();
    for (const sheet of sheets) {
        console.log(sheet.name);
    }
});
//# sourceMappingURL=completion.js.map