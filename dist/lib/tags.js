"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTags = exports.matchByTag = exports.validateTags = exports.parseTags = void 0;
const types_1 = require("../types");
// カンマ区切りのタグ文字列をパースする（トリム・空要素除去・重複排除）
const parseTags = (input) => {
    const tags = input
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');
    return Array.from(new Set(tags.map((tag) => tag.toLowerCase())));
};
exports.parseTags = parseTags;
// タグのバリデーション（シート名と同じルール）
const validateTags = (tags) => {
    return tags.filter((tag) => !types_1.NAME_PATTERN.test(tag));
};
exports.validateTags = validateTags;
// シートが指定タグを持つかチェック（大文字小文字を区別しない）
const matchByTag = (sheet, tag) => {
    if (!sheet.tags || sheet.tags.length === 0) {
        return false;
    }
    const lowerTag = tag.toLowerCase();
    return sheet.tags.some((t) => t.toLowerCase() === lowerTag);
};
exports.matchByTag = matchByTag;
// タグ配列を表示用文字列に変換
const formatTags = (tags) => {
    if (!tags || tags.length === 0) {
        return '-';
    }
    return tags.join(', ');
};
exports.formatTags = formatTags;
//# sourceMappingURL=tags.js.map