import { Command } from 'commander';
import chalk from 'chalk';
import {
  CONFIG_KEYS,
  ConfigKey,
  CONFIG_DIR,
  loadConfig,
  saveConfig,
  getEditor,
} from '../lib/config';

const isConfigKey = (key: string): key is ConfigKey =>
  (CONFIG_KEYS as readonly string[]).includes(key);

// 全設定を表示
const showAll = (): void => {
  const config = loadConfig();
  const editorLine = config.editor
    ? config.editor
    : chalk.gray(`(not set, using ${getEditor()})`);
  const dirLine = config.dir ? config.dir : chalk.gray(`(not set, using ${CONFIG_DIR})`);

  console.log(`editor = ${editorLine}`);
  console.log(`dir    = ${dirLine}`);
};

export const configCommand = new Command('config')
  .description('Get or set configuration (keys: editor, dir)')
  .argument('[key]', `Config key: ${CONFIG_KEYS.join(' | ')}`)
  .argument('[value]', 'Value to set (omit to show the current value)')
  .option('--unset', 'Remove the key from config')
  .action(async (key: string | undefined, value: string | undefined, options: { unset?: boolean }) => {
    // キーなし → 全表示
    if (!key) {
      showAll();
      return;
    }

    if (!isConfigKey(key)) {
      console.error(chalk.red(`Error: Unknown config key "${key}" (valid keys: ${CONFIG_KEYS.join(', ')})`));
      process.exit(1);
    }

    const config = loadConfig();

    // --unset → キー削除
    if (options.unset) {
      delete config[key];
      saveConfig(config);
      console.log(chalk.green(`Unset ${key}`));
      return;
    }

    // 値なし → 現在値を表示
    if (value === undefined) {
      if (config[key]) {
        console.log(config[key]);
      } else {
        const effective = key === 'editor' ? getEditor() : CONFIG_DIR;
        console.log(chalk.gray(`(not set, using ${effective})`));
      }
      return;
    }

    // 値あり → 設定
    config[key] = value;
    saveConfig(config);
    console.log(chalk.green(`Set ${key} = ${value}`));

    if (key === 'dir') {
      console.log(
        chalk.yellow(
          'Note: existing sheets are not moved automatically. Move the contents of the old directory to the new location if needed.'
        )
      );
    }
  });
