# チートシートCLIツール「cs」の作成

コマンドやツールのチートシートをローカルに保存・管理できるCLIツールを作成してください。

## 基本情報

- パッケージ名: `cheatsheet-cli`
- コマンド名: `cs`
- 言語: TypeScript
- 配布: npm でグローバルインストール可能にする

## コマンド仕様

| コマンド | 説明 |
|---------|------|
| `cs add <name>` | チートシートを追加（$EDITORでエディタ起動、未設定ならvim） |
| `cs add <name> --file <path>` | 既存ファイルから追加 |
| `cs add <name> --image <path>` | 画像ファイルを追加 |
| `cs list` | 一覧表示（名前、種類、更新日時） |
| `cs show <name>` | 内容を表示（画像の場合はパスを表示し、--openで外部ビューアで開く） |
| `cs search <keyword>` | ファイル名と内容からキーワード検索 |
| `cs edit <name>` | エディタで編集（テキストのみ） |
| `cs rm <name>` | 削除（確認プロンプトあり、--forceでスキップ） |
| `cs export <name>` | カレントディレクトリにエクスポート |
| `cs export <name> --out <path>` | 指定パスにエクスポート |

## データ保存

保存先: `~/.config/cheatsheet-cli/`
```
~/.config/cheatsheet-cli/
├── data.json             # メタデータ（名前、種類、作成日、更新日）
├── sheets/               # テキストファイル（Markdown）
│   └── {name}.md
└── images/               # 画像ファイル（元の拡張子を保持）
    └── {name}.{ext}
```

### data.json の構造
```json
{
  "sheets": [
    {
      "name": "git-rebase",
      "type": "text",
      "filename": "git-rebase.md",
      "createdAt": "2025-01-16T10:00:00Z",
      "updatedAt": "2025-01-16T10:00:00Z"
    },
    {
      "name": "vim-cheatsheet", 
      "type": "image",
      "filename": "vim-cheatsheet.png",
      "createdAt": "2025-01-16T10:00:00Z",
      "updatedAt": "2025-01-16T10:00:00Z"
    }
  ]
}
```

## ディレクトリ構成
```
cheatsheet-cli/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts          # CLIエントリーポイント（commander使用）
│   ├── commands/
│   │   ├── add.ts
│   │   ├── list.ts
│   │   ├── show.ts
│   │   ├── search.ts
│   │   ├── edit.ts
│   │   ├── remove.ts
│   │   └── export.ts
│   ├── lib/
│   │   ├── storage.ts    # データ読み書き、ファイル操作
│   │   └── config.ts     # パス管理、設定
│   └── types.ts          # 型定義
└── bin/
    └── cs.js             # シバン付き実行ファイル
```

## 使用ライブラリ

- commander: CLIフレームワーク
- chalk: ターミナル装飾
- fs-extra: ファイル操作
- cli-table3: テーブル表示（list用）
- open: 外部アプリで開く（画像表示用）

## 実装上の注意

1. nameに使える文字は英数字、ハイフン、アンダースコアのみ（バリデーション必須）
2. 同名のシートが存在する場合は上書き確認
3. エラーメッセージは分かりやすく、chalkで色付け
4. 存在しないシート名を指定した場合は適切なエラー表示
5. 画像ファイルの対応形式: png, jpg, jpeg, gif, webp, svg
6. `cs show`でテキストはシンタックスハイライトなしでそのまま表示

## package.json の設定
```json
{
  "name": "cheatsheet-cli",
  "bin": {
    "cs": "./bin/cs.js"
  }
}
```

## 不要な機能（実装しない）

- タグ機能
- お気に入り機能
- クラウド同期
- インポート機能（バルク）

