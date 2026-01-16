"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSheetsByName = exports.createSearchResult = exports.matchByContent = exports.matchByName = void 0;
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
//# sourceMappingURL=search.js.map