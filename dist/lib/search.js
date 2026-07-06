"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightKeyword = exports.findMatchingLines = exports.fuzzyMatch = exports.searchSheetsByName = exports.createSearchResult = exports.matchByContent = exports.matchByName = void 0;
// シート名で検索
const matchByName = (sheet, keyword) => {
    return sheet.name.toLowerCase().includes(keyword.toLowerCase());
};
exports.matchByName = matchByName;
// コンテンツで検索
const matchByContent = (content, keyword) => {
    return content.toLowerCase().includes(keyword.toLowerCase());
};
exports.matchByContent = matchByContent;
// 検索結果を生成
const createSearchResult = (sheet, matchType) => {
    return {
        name: sheet.name,
        type: sheet.type,
        matchType,
    };
};
exports.createSearchResult = createSearchResult;
// シートを検索（名前のみ）
const searchSheetsByName = (sheets, keyword) => {
    return sheets
        .filter(sheet => (0, exports.matchByName)(sheet, keyword))
        .map(sheet => (0, exports.createSearchResult)(sheet, 'name'));
};
exports.searchSheetsByName = searchSheetsByName;
// fuzzy検索: キーワードの文字が順番どおりに現れればマッチ（例: "gitcmd" → "git-commands"）
const fuzzyMatch = (text, keyword) => {
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
exports.fuzzyMatch = fuzzyMatch;
// キーワードにマッチする行を行番号付きで抽出（grep風コンテキスト表示用）
const findMatchingLines = (content, keyword, limit = 3) => {
    const lowerKeyword = keyword.toLowerCase();
    const results = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length && results.length < limit; i++) {
        if (lines[i].toLowerCase().includes(lowerKeyword)) {
            results.push({ lineNumber: i + 1, line: lines[i].trim() });
        }
    }
    return results;
};
exports.findMatchingLines = findMatchingLines;
// 行内のキーワード（大文字小文字無視・全出現箇所）をcolorizeで装飾する
const highlightKeyword = (line, keyword, colorize) => {
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
exports.highlightKeyword = highlightKeyword;
//# sourceMappingURL=search.js.map