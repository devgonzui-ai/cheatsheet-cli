import { Sheet } from '../types';

export interface SearchResult {
  name: string;
  type: 'text' | 'image';
  matchType: 'name' | 'content';
}

// シート名で検索
export const matchByName = (sheet: Sheet, keyword: string): boolean => {
  return sheet.name.toLowerCase().includes(keyword.toLowerCase());
};

// コンテンツで検索
export const matchByContent = (content: string, keyword: string): boolean => {
  return content.toLowerCase().includes(keyword.toLowerCase());
};

// 検索結果を生成
export const createSearchResult = (
  sheet: Sheet,
  matchType: 'name' | 'content'
): SearchResult => {
  return {
    name: sheet.name,
    type: sheet.type,
    matchType,
  };
};

// シートを検索（名前のみ）
export const searchSheetsByName = (
  sheets: Sheet[],
  keyword: string
): SearchResult[] => {
  return sheets
    .filter(sheet => matchByName(sheet, keyword))
    .map(sheet => createSearchResult(sheet, 'name'));
};
