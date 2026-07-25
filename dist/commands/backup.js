"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreCommand = exports.backupCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_1 = require("../lib/config");
const backup_1 = require("../lib/backup");
exports.backupCommand = new commander_1.Command('backup')
    .description('Back up all cheatsheets to a tar.gz archive')
    .option('-o, --out <path>', 'Output file or directory (default: ./cheatsheet-backup-<timestamp>.tar.gz)')
    .action(async (options) => {
    try {
        const file = (0, backup_1.resolveBackupPath)(options.out, process.cwd());
        await (0, backup_1.createBackup)(file);
        const total = await (0, backup_1.countSheets)();
        console.log(chalk_1.default.green(`Backed up ${total} sheet(s) to ${file}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
exports.restoreCommand = new commander_1.Command('restore')
    .description('Restore cheatsheets from a backup archive')
    .argument('<file>', 'Backup file created by `cs backup`')
    .option('--force', 'Overwrite existing data without confirmation')
    .action(async (file, options) => {
    try {
        if (!(await fs_extra_1.default.pathExists(file))) {
            console.error(chalk_1.default.red(`Error: File not found: ${file}`));
            process.exit(1);
        }
        if ((await (0, backup_1.hasExistingData)()) && !options.force) {
            console.error(chalk_1.default.red(`Error: Existing cheatsheets found in ${config_1.CONFIG_DIR}. Use --force to overwrite them with the backup`));
            process.exit(1);
        }
        await (0, backup_1.restoreBackup)(file);
        const total = await (0, backup_1.countSheets)();
        console.log(chalk_1.default.green(`Restored ${total} sheet(s) from ${file}`));
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=backup.js.map