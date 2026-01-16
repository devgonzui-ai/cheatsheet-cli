"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const types_1 = require("../types");
const storage_1 = require("../lib/storage");
(0, vitest_1.describe)('NAME_PATTERN', () => {
    (0, vitest_1.it)('英小文字のみを許可する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('gitcommands')).toBe(true);
    });
    (0, vitest_1.it)('英大文字のみを許可する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('GITCOMMANDS')).toBe(true);
    });
    (0, vitest_1.it)('数字のみを許可する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('12345')).toBe(true);
    });
    (0, vitest_1.it)('ハイフンを含む名前を許可する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('git-commands')).toBe(true);
    });
    (0, vitest_1.it)('アンダースコアを含む名前を許可する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('git_commands')).toBe(true);
    });
    (0, vitest_1.it)('英数字、ハイフン、アンダースコアの組み合わせを許可する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('my-Cheat_Sheet123')).toBe(true);
    });
    (0, vitest_1.it)('日本語を含む名前を拒否する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('日本語')).toBe(false);
    });
    (0, vitest_1.it)('スペースを含む名前を拒否する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('git commands')).toBe(false);
    });
    (0, vitest_1.it)('特殊文字を含む名前を拒否する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('git@commands')).toBe(false);
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('git.commands')).toBe(false);
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('git/commands')).toBe(false);
    });
    (0, vitest_1.it)('空文字を拒否する', () => {
        (0, vitest_1.expect)(types_1.NAME_PATTERN.test('')).toBe(false);
    });
});
(0, vitest_1.describe)('validateName', () => {
    (0, vitest_1.it)('有効な名前でtrueを返す', () => {
        (0, vitest_1.expect)((0, storage_1.validateName)('git-cheat')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.validateName)('vim_commands')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.validateName)('Docker123')).toBe(true);
    });
    (0, vitest_1.it)('無効な名前でfalseを返す', () => {
        (0, vitest_1.expect)((0, storage_1.validateName)('')).toBe(false);
        (0, vitest_1.expect)((0, storage_1.validateName)('invalid name')).toBe(false);
        (0, vitest_1.expect)((0, storage_1.validateName)('日本語')).toBe(false);
    });
});
(0, vitest_1.describe)('isValidImageExtension', () => {
    (0, vitest_1.it)('サポートされている画像拡張子でtrueを返す', () => {
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.png')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.jpg')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.jpeg')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.gif')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.webp')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.svg')).toBe(true);
    });
    (0, vitest_1.it)('大文字の拡張子でもtrueを返す', () => {
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.PNG')).toBe(true);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.JPG')).toBe(true);
    });
    (0, vitest_1.it)('サポートされていない拡張子でfalseを返す', () => {
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.bmp')).toBe(false);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('image.tiff')).toBe(false);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('document.pdf')).toBe(false);
        (0, vitest_1.expect)((0, storage_1.isValidImageExtension)('text.md')).toBe(false);
    });
});
(0, vitest_1.describe)('SUPPORTED_IMAGE_EXTENSIONS', () => {
    (0, vitest_1.it)('6つの画像形式をサポートする', () => {
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toHaveLength(6);
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toContain('png');
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toContain('jpg');
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toContain('jpeg');
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toContain('gif');
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toContain('webp');
        (0, vitest_1.expect)(types_1.SUPPORTED_IMAGE_EXTENSIONS).toContain('svg');
    });
});
//# sourceMappingURL=validation.test.js.map