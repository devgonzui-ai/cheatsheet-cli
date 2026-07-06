"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../lib/config");
const isConfigKey = (key) => config_1.CONFIG_KEYS.includes(key);
// 全設定を表示
const showAll = () => {
    const config = (0, config_1.loadConfig)();
    const editorLine = config.editor
        ? config.editor
        : chalk_1.default.gray(`(not set, using ${(0, config_1.getEditor)()})`);
    const dirLine = config.dir ? config.dir : chalk_1.default.gray(`(not set, using ${config_1.CONFIG_DIR})`);
    console.log(`editor = ${editorLine}`);
    console.log(`dir    = ${dirLine}`);
};
exports.configCommand = new commander_1.Command('config')
    .description('Get or set configuration (keys: editor, dir)')
    .argument('[key]', `Config key: ${config_1.CONFIG_KEYS.join(' | ')}`)
    .argument('[value]', 'Value to set (omit to show the current value)')
    .option('--unset', 'Remove the key from config')
    .action(async (key, value, options) => {
    // キーなし → 全表示
    if (!key) {
        showAll();
        return;
    }
    if (!isConfigKey(key)) {
        console.error(chalk_1.default.red(`Error: Unknown config key "${key}" (valid keys: ${config_1.CONFIG_KEYS.join(', ')})`));
        process.exit(1);
    }
    const config = (0, config_1.loadConfig)();
    // --unset → キー削除
    if (options.unset) {
        delete config[key];
        (0, config_1.saveConfig)(config);
        console.log(chalk_1.default.green(`Unset ${key}`));
        return;
    }
    // 値なし → 現在値を表示
    if (value === undefined) {
        if (config[key]) {
            console.log(config[key]);
        }
        else {
            const effective = key === 'editor' ? (0, config_1.getEditor)() : config_1.CONFIG_DIR;
            console.log(chalk_1.default.gray(`(not set, using ${effective})`));
        }
        return;
    }
    // 値あり → 設定
    config[key] = value;
    (0, config_1.saveConfig)(config);
    console.log(chalk_1.default.green(`Set ${key} = ${value}`));
    if (key === 'dir') {
        console.log(chalk_1.default.yellow('Note: existing sheets are not moved automatically. Move the contents of the old directory to the new location if needed.'));
    }
});
//# sourceMappingURL=config.js.map