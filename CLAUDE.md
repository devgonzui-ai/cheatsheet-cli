# cheatsheet-cli

コマンドやツールのチートシートをローカルに保存・管理できるCLIツール

## コマンド

```bash
# ビルド
npm run build

# テスト実行
npm test

# 開発モード（watchモード）
npm run dev

# CLIを実行
node dist/index.js
# または
./bin/cs.js
```

## プロジェクト構造

```
src/
├── index.ts          # エントリーポイント
├── types.ts          # 型定義
├── commands/         # サブコマンド
│   ├── add.ts        # チートシート追加
│   ├── list.ts       # 一覧表示
│   ├── show.ts       # 詳細表示
│   ├── search.ts     # 検索
│   ├── edit.ts       # 編集
│   ├── remove.ts     # 削除
│   └── export.ts     # エクスポート
├── lib/              # ユーティリティ
│   ├── config.ts     # 設定管理
│   ├── storage.ts    # ストレージ操作
│   ├── search.ts     # 検索ロジック
│   └── markdown.ts   # Markdownパース
└── __tests__/        # テストファイル
```

## 技術スタック

- TypeScript
- Commander.js (CLI framework)
- Vitest (テスト)
- chalk, cli-highlight, cli-table3 (表示)
