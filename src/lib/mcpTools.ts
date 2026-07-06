import {
  getAllSheets,
  getSheet,
  readSheetContent,
  addOrUpdateSheet,
  writeSheetContent,
  validateName,
} from './storage';
import { Sheet } from '../types';
import { matchByTag, parseTags, validateTags, formatTags } from './tags';

// MCPツールの実行結果（テキストのみ）
export interface ToolResult {
  text: string;
  isError?: boolean;
}

const ok = (text: string): ToolResult => ({ text });
const err = (text: string): ToolResult => ({ text, isError: true });

// シート1件を一覧用の1行に整形
const formatSheetLine = (sheet: Sheet): string => {
  const type = sheet.type === 'text' ? 'text' : 'image';
  const tags = sheet.tags && sheet.tags.length > 0 ? ` [tags: ${formatTags(sheet.tags)}]` : '';
  return `- ${sheet.name} (${type})${tags}`;
};

// 一覧取得（タグで絞り込み可能）
export const listCheatsheets = async (tag?: string): Promise<ToolResult> => {
  let sheets = await getAllSheets();

  if (tag) {
    sheets = sheets.filter((sheet) => matchByTag(sheet, tag));
  }

  if (sheets.length === 0) {
    return ok(tag ? `No cheatsheets found with tag "${tag}"` : 'No cheatsheets found');
  }

  sheets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return ok(`${sheets.length} cheatsheet(s):\n${sheets.map(formatSheetLine).join('\n')}`);
};

// キーワード・タグ検索
export const searchCheatsheets = async (keyword?: string, tag?: string): Promise<ToolResult> => {
  if (!keyword && !tag) {
    return err('Error: Specify a keyword and/or a tag');
  }

  let sheets = await getAllSheets();

  if (tag) {
    sheets = sheets.filter((sheet) => matchByTag(sheet, tag));
  }

  const results: { sheet: Sheet; matchType: string }[] = [];

  if (!keyword) {
    for (const sheet of sheets) {
      results.push({ sheet, matchType: 'tag' });
    }
  } else {
    const lowerKeyword = keyword.toLowerCase();
    for (const sheet of sheets) {
      if (sheet.name.toLowerCase().includes(lowerKeyword)) {
        results.push({ sheet, matchType: 'name' });
        continue;
      }
      if (sheet.type === 'text') {
        const content = await readSheetContent(sheet);
        if (content.toLowerCase().includes(lowerKeyword)) {
          results.push({ sheet, matchType: 'content' });
        }
      }
    }
  }

  if (results.length === 0) {
    return ok('No matching cheatsheets found');
  }

  const lines = results.map(
    (r) => `${formatSheetLine(r.sheet)} — matched by ${r.matchType}`
  );
  return ok(`${results.length} result(s):\n${lines.join('\n')}`);
};

// シート本文の取得
export const getCheatsheet = async (name: string): Promise<ToolResult> => {
  const sheet = await getSheet(name);

  if (!sheet) {
    return err(`Error: Cheatsheet "${name}" not found. Use list_cheatsheets or search_cheatsheets to find available sheets.`);
  }

  if (sheet.type === 'image') {
    return err(`Error: "${name}" is an image cheatsheet and cannot be returned as text`);
  }

  const content = await readSheetContent(sheet);
  return ok(content);
};

// シートの追加・上書き
export const addCheatsheet = async (input: {
  name: string;
  content: string;
  tags?: string;
  overwrite?: boolean;
}): Promise<ToolResult> => {
  const { name, content, overwrite } = input;

  if (!validateName(name)) {
    return err('Error: Name can only contain alphanumeric characters, hyphens, and underscores');
  }

  if (content.trim() === '') {
    return err('Error: Content is empty');
  }

  let tags: string[] | undefined;
  if (input.tags) {
    tags = parseTags(input.tags);
    const invalidTags = validateTags(tags);
    if (invalidTags.length > 0) {
      return err(`Error: Invalid tag(s): ${invalidTags.join(', ')}`);
    }
  }

  const existingSheet = await getSheet(name);
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
  const sheet: Sheet = {
    name,
    type: 'text',
    filename: `${name}.md`,
    tags,
    createdAt: existingSheet?.createdAt || now,
    updatedAt: now,
  };

  await addOrUpdateSheet(sheet);
  await writeSheetContent(sheet, content);

  return ok(`${existingSheet ? 'Updated' : 'Added'} cheatsheet "${name}"${tags && tags.length > 0 ? ` with tags: ${formatTags(tags)}` : ''}`);
};
