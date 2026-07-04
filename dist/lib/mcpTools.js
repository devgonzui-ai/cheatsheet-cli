"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCheatsheet = exports.getCheatsheet = exports.searchCheatsheets = exports.listCheatsheets = void 0;
const storage_1 = require("./storage");
const tags_1 = require("./tags");
const ok = (text) => ({ text });
const err = (text) => ({ text, isError: true });
// シート1件を一覧用の1行に整形
const formatSheetLine = (sheet) => {
    const type = sheet.type === 'text' ? 'text' : 'image';
    const tags = sheet.tags && sheet.tags.length > 0 ? ` [tags: ${(0, tags_1.formatTags)(sheet.tags)}]` : '';
    return `- ${sheet.name} (${type})${tags}`;
};
// 一覧取得（タグで絞り込み可能）
const listCheatsheets = async (tag) => {
    let sheets = await (0, storage_1.getAllSheets)();
    if (tag) {
        sheets = sheets.filter((sheet) => (0, tags_1.matchByTag)(sheet, tag));
    }
    if (sheets.length === 0) {
        return ok(tag ? `No cheatsheets found with tag "${tag}"` : 'No cheatsheets found');
    }
    sheets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return ok(`${sheets.length} cheatsheet(s):\n${sheets.map(formatSheetLine).join('\n')}`);
};
exports.listCheatsheets = listCheatsheets;
// キーワード・タグ検索
const searchCheatsheets = async (keyword, tag) => {
    if (!keyword && !tag) {
        return err('Error: Specify a keyword and/or a tag');
    }
    let sheets = await (0, storage_1.getAllSheets)();
    if (tag) {
        sheets = sheets.filter((sheet) => (0, tags_1.matchByTag)(sheet, tag));
    }
    const results = [];
    if (!keyword) {
        for (const sheet of sheets) {
            results.push({ sheet, matchType: 'tag' });
        }
    }
    else {
        const lowerKeyword = keyword.toLowerCase();
        for (const sheet of sheets) {
            if (sheet.name.toLowerCase().includes(lowerKeyword)) {
                results.push({ sheet, matchType: 'name' });
                continue;
            }
            if (sheet.type === 'text') {
                const content = await (0, storage_1.readSheetContent)(sheet);
                if (content.toLowerCase().includes(lowerKeyword)) {
                    results.push({ sheet, matchType: 'content' });
                }
            }
        }
    }
    if (results.length === 0) {
        return ok('No matching cheatsheets found');
    }
    const lines = results.map((r) => `${formatSheetLine(r.sheet)} — matched by ${r.matchType}`);
    return ok(`${results.length} result(s):\n${lines.join('\n')}`);
};
exports.searchCheatsheets = searchCheatsheets;
// シート本文の取得
const getCheatsheet = async (name) => {
    const sheet = await (0, storage_1.getSheet)(name);
    if (!sheet) {
        return err(`Error: Cheatsheet "${name}" not found. Use list_cheatsheets or search_cheatsheets to find available sheets.`);
    }
    if (sheet.type === 'image') {
        return err(`Error: "${name}" is an image cheatsheet and cannot be returned as text`);
    }
    const content = await (0, storage_1.readSheetContent)(sheet);
    return ok(content);
};
exports.getCheatsheet = getCheatsheet;
// シートの追加・上書き
const addCheatsheet = async (input) => {
    const { name, content, overwrite } = input;
    if (!(0, storage_1.validateName)(name)) {
        return err('Error: Name can only contain alphanumeric characters, hyphens, and underscores');
    }
    if (content.trim() === '') {
        return err('Error: Content is empty');
    }
    let tags;
    if (input.tags) {
        tags = (0, tags_1.parseTags)(input.tags);
        const invalidTags = (0, tags_1.validateTags)(tags);
        if (invalidTags.length > 0) {
            return err(`Error: Invalid tag(s): ${invalidTags.join(', ')}`);
        }
    }
    const existingSheet = await (0, storage_1.getSheet)(name);
    if (existingSheet && !overwrite) {
        return err(`Error: Cheatsheet "${name}" already exists. Set overwrite to true to replace it.`);
    }
    if (existingSheet?.type === 'image') {
        return err(`Error: "${name}" is an image cheatsheet and cannot be overwritten with text`);
    }
    // タグ未指定で上書きする場合は既存のタグを引き継ぐ
    if (!tags && existingSheet?.tags) {
        tags = existingSheet.tags;
    }
    const now = new Date().toISOString();
    const sheet = {
        name,
        type: 'text',
        filename: `${name}.md`,
        tags,
        createdAt: existingSheet?.createdAt || now,
        updatedAt: now,
    };
    await (0, storage_1.addOrUpdateSheet)(sheet);
    await (0, storage_1.writeSheetContent)(sheet, content);
    return ok(`${existingSheet ? 'Updated' : 'Added'} cheatsheet "${name}"${tags && tags.length > 0 ? ` with tags: ${(0, tags_1.formatTags)(tags)}` : ''}`);
};
exports.addCheatsheet = addCheatsheet;
//# sourceMappingURL=mcpTools.js.map