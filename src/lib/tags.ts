import { Sheet, NAME_PATTERN } from '../types';

// カンマ区切りのタグ文字列をパースする（トリム・空要素除去・重複排除）
export const parseTags = (input: string): string[] => {
  const tags = input
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '');
  return Array.from(new Set(tags.map((tag) => tag.toLowerCase())));
};

// タグのバリデーション（シート名と同じルール）
export const validateTags = (tags: string[]): string[] => {
  return tags.filter((tag) => !NAME_PATTERN.test(tag));
};

// シートが指定タグを持つかチェック（大文字小文字を区別しない）
export const matchByTag = (sheet: Sheet, tag: string): boolean => {
  if (!sheet.tags || sheet.tags.length === 0) {
    return false;
  }
  const lowerTag = tag.toLowerCase();
  return sheet.tags.some((t) => t.toLowerCase() === lowerTag);
};

// タグ配列を表示用文字列に変換
export const formatTags = (tags?: string[]): string => {
  if (!tags || tags.length === 0) {
    return '-';
  }
  return tags.join(', ');
};
