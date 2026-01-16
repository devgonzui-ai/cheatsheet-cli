// チートシートの種類
export type SheetType = 'text' | 'image';

// チートシートのメタデータ
export interface Sheet {
  name: string;
  type: SheetType;
  filename: string;
  createdAt: string;
  updatedAt: string;
}

// data.json の構造
export interface DataStore {
  sheets: Sheet[];
}

// サポートする画像拡張子
export const SUPPORTED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] as const;

// 名前のバリデーション用正規表現（英数字、ハイフン、アンダースコアのみ）
export const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
