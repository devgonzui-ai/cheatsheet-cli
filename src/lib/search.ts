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

// fuzzy検索: キーワードの文字が順番どおりに現れればマッチ（例: "gitcmd" → "git-commands"）
export const fuzzyMatch = (text: string, keyword: string): boolean => {
  const target = text.toLowerCase();
  const query = keyword.toLowerCase();
  if (query === '') {
    return true;
  }
  let i = 0;
  for (const ch of target) {
    if (ch === query[i]) {
      i++;
      if (i === query.length) {
        return true;
      }
    }
  }
  return false;
};

export interface MatchLine {
  lineNumber: number;
  line: string;
}

// キーワードにマッチする行を行番号付きで抽出（grep風コンテキスト表示用）
export const findMatchingLines = (
  content: string,
  keyword: string,
  limit = 3
): MatchLine[] => {
  const lowerKeyword = keyword.toLowerCase();
  const results: MatchLine[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length && results.length < limit; i++) {
    if (lines[i].toLowerCase().includes(lowerKeyword)) {
      results.push({ lineNumber: i + 1, line: lines[i].trim() });
    }
  }
  return results;
};

// 行内のキーワード（大文字小文字無視・全出現箇所）をcolorizeで装飾する
export const highlightKeyword = (
  line: string,
  keyword: string,
  colorize: (match: string) => string
): string => {
  if (keyword === '') {
    return line;
  }
  const lowerLine = line.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let result = '';
  let index = 0;

  for (;;) {
    const found = lowerLine.indexOf(lowerKeyword, index);
    if (found === -1) {
      result += line.slice(index);
      return result;
    }
    result += line.slice(index, found) + colorize(line.slice(found, found + keyword.length));
    index = found + keyword.length;
  }
};
