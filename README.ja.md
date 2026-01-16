# cheatsheet-cli (cs)

コマンドやツールのチートシートをローカルに保存・管理できるCLIツール。

[English README](./README.md)

## インストール

```bash
npm install -g @gonzui/csheet-cli
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `cs add <name>` | チートシートを追加（$EDITORでエディタ起動、未設定ならvim） |
| `cs add <name> --file <path>` | 既存ファイルから追加 |
| `cs list` | 一覧表示 |
| `cs show <name>` | 内容を表示（Markdownレンダリング付き） |
| `cs show <name> --raw` | 生のMarkdownを表示 |
| `cs search <keyword>` | ファイル名と内容からキーワード検索 |
| `cs edit <name>` | エディタで編集 |
| `cs rm <name>` | 削除（確認プロンプトあり） |
| `cs rm <name> --force` | 確認なしで削除 |
| `cs export <name>` | カレントディレクトリにエクスポート |
| `cs export <name> --out <path>` | 指定パスにエクスポート |

## 使用例

### チートシートの追加

```bash
# エディタで新規作成
cs add git-commands

# 既存ファイルから追加
cs add docker-tips --file ~/notes/docker.md
```

### 表示

```bash
# 一覧表示
cs list

# 内容表示（Markdownレンダリング）
cs show git-commands

# 生のMarkdownを表示
cs show git-commands --raw
```

### 検索

```bash
# 名前と内容から検索
cs search commit
```

### 編集・削除

```bash
# エディタで編集
cs edit git-commands

# 確認付きで削除
cs rm old-cheatsheet

# 確認なしで削除
cs rm old-cheatsheet --force
```

### エクスポート

```bash
# カレントディレクトリに出力
cs export git-commands

# 指定パスに出力
cs export git-commands --out ~/backup/
```

## 機能

- **Markdownレンダリング**: コードブロックのシンタックスハイライト、テーブルの整形、見出しの色分け
- **全文検索**: チートシート名と内容からキーワード検索
- **エディタ連携**: 環境変数 `$EDITOR` を使用（未設定時はvim）

## データ保存場所

チートシートは `~/.config/cheatsheet-cli/` に保存されます：

```
~/.config/cheatsheet-cli/
├── data.json      # メタデータ
└── sheets/        # Markdownファイル
    └── {name}.md
```

## 命名規則

チートシート名に使用できる文字：
- 英数字（a-z, A-Z, 0-9）
- ハイフン（-）
- アンダースコア（_）

## 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト実行
npm test

# ウォッチモード
npm run test:watch
```

## ライセンス

MIT
