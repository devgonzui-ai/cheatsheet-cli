"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAME_PATTERN = exports.SUPPORTED_IMAGE_EXTENSIONS = void 0;
// サポートする画像拡張子
exports.SUPPORTED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
// 名前のバリデーション用正規表現（英数字、ハイフン、アンダースコアのみ）
exports.NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
//# sourceMappingURL=types.js.map