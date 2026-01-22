# csheet-cli (cs) コマンド

## インストール

```bash
npm install -g @gonzui/csheet-cli
```

## 基本コマンド

| コマンド | 説明 |
|---------|------|
| `cs add <name>` | チートシートを追加 |
| `cs list` | 一覧表示 |
| `cs show <name>` | 内容を表示 |
| `cs search <keyword>` | キーワード検索 |
| `cs edit <name>` | 編集 |
| `cs rm <name>` | 削除 |
| `cs export <name>` | エクスポート |

## 追加 (add)

```bash
# エディタで新規作成
cs add git-commands

# 既存ファイルから追加
cs add docker-tips --file ~/notes/docker.md
```

## 表示 (show)

```bash
# Markdownレンダリング付き
cs show git-commands

# 生のMarkdown
cs show git-commands --raw
```

## 削除 (rm)

```bash
# 確認あり
cs rm old-sheet

# 確認なし
cs rm old-sheet --force
```

## エクスポート (export)

```bash
# カレントディレクトリに出力
cs export git-commands

# 指定パスに出力
cs export git-commands --out ~/backup/
```

## データ保存場所

```
~/.config/cheatsheet-cli/
├── data.json      # メタデータ
└── sheets/        # Markdownファイル
```
