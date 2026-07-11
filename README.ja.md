# cheatsheet-cli (cs)

[![npm version](https://img.shields.io/npm/v/@gonzui/csheet-cli.svg)](https://www.npmjs.com/package/@gonzui/csheet-cli)
[![npm downloads](https://img.shields.io/npm/dm/@gonzui/csheet-cli.svg)](https://www.npmjs.com/package/@gonzui/csheet-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

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
| `cs add <name> --stdin` | 標準入力から追加（例: `tldr tar \| cs add tar-tips --stdin`） |
| `cs add <name> --tag <tags>` | カンマ区切りのタグを付けて追加 |
| `cs gen <name> <topic>` | Claude AIでチートシートを生成（要 `ANTHROPIC_API_KEY`） |
| `cs refine <name>` | Claude AIで雑なメモを整形されたMarkdownに書き直す |
| `cs list` | 一覧表示 |
| `cs list --tag <tag>` | タグで絞り込んで一覧表示 |
| `cs show <name>` | 内容を表示（Markdownレンダリング付き） |
| `cs show <name> --raw` | 生のMarkdownを表示 |
| `cs copy <name>` | コードブロックをクリップボードにコピー（複数ある場合は選択式） |
| `cs copy <name> <index>` | N番目のコードブロックをコピー |
| `cs copy <name> --all` | シート全体をコピー |
| `cs search <keyword>` | ファイル名と内容からキーワード検索 |
| `cs search --tag <tag>` | タグで検索（キーワードとの併用可） |
| `cs edit <name>` | エディタで編集 |
| `cs rm <name>` | 削除（確認プロンプトあり） |
| `cs rm <name> --force` | 確認なしで削除 |
| `cs rename <old> <new>` | チートシートの名前を変更 |
| `cs rename <old> <new> -f` | 新しい名前が存在する場合も強制変更 |
| `cs export <name>` | カレントディレクトリにエクスポート |
| `cs export <name> --out <path>` | 指定パスにエクスポート |
| `cs mcp` | AIエージェント用のMCPサーバーを起動（Claude Code / Claude Desktop など） |

## 使用例

### チートシートの追加

```bash
# エディタで新規作成
cs add git-commands

# 既存ファイルから追加
cs add docker-tips --file ~/notes/docker.md

# エディタを開かずに標準入力から追加
tldr tar | cs add tar-tips --stdin

# タグを付けて追加
cs add git-commands --tag git,vcs
```

### AIで生成・整形

`cs gen` と `cs refine` は Claude API を直接呼び出すため、APIキーが必要です（`cs mcp` はキー不要）。先に環境変数 `ANTHROPIC_API_KEY` を設定してください。

```bash
# トピックからチートシートを生成
cs gen jq-basics jq basics --tag json

# パイプで突っ込んだ雑なメモをきれいなチートシートに整形
history | tail -50 | cs add docker-notes --stdin
cs refine docker-notes

# 保存せずに整形結果をプレビュー
cs refine docker-notes --dry-run
```

### 表示

```bash
# 一覧表示
cs list

# タグで絞り込んで一覧表示
cs list --tag git

# 内容表示（Markdownレンダリング）
cs show git-commands

# 生のMarkdownを表示
cs show git-commands --raw
```

### クリップボードにコピー

```bash
# コードブロックをコピー（複数ある場合は番号を選択）
cs copy git-commands

# 2番目のコードブロックを直接コピー
cs copy git-commands 2

# シート全体をコピー
cs copy git-commands --all
```

### 検索

```bash
# 名前と内容から検索
cs search commit

# タグで検索
cs search --tag git

# キーワードとタグを組み合わせて検索
cs search commit --tag git
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

### MCPサーバー（AI連携）

`cs mcp` は [MCP](https://modelcontextprotocol.io/) サーバーを stdio で起動し、ローカルのチートシートを AIエージェントのナレッジベースにします。APIキー不要（接続するAIエージェント側が処理します）。

```bash
# Claude Code に登録
claude mcp add cheatsheet -- cs mcp
```

Claude Desktop（`claude_desktop_config.json`）:

```json
{
  "mcpServers": {
    "cheatsheet": { "command": "cs", "args": ["mcp"] }
  }
}
```

接続後、エージェントは以下ができます:

| MCPツール | 説明 |
|----------|------|
| `search_cheatsheets` | キーワード・タグでシートを検索 |
| `get_cheatsheet` | シートのMarkdown本文を取得 |
| `list_cheatsheets` | タグ付きで全シートを一覧 |
| `add_cheatsheet` | 新しい知見をチートシートとして保存（タグ対応） |

「デプロイ手順、あたしのチートシートから探して」「このjqワンライナー集をチートシートに保存して」みたいな使い方ができます。

## 機能

- **MCPサーバー**: `cs mcp` でチートシートをAIエージェントに公開
- **AI生成**: `cs gen` でトピックからチートシートを生成、`cs refine` で雑なメモを整形（Claude API）
- **Markdownレンダリング**: コードブロックのシンタックスハイライト、テーブルの整形、見出しの色分け
- **全文検索**: チートシート名と内容からキーワード検索
- **タグ管理**: タグによるチートシートの整理・絞り込み
- **クリップボードコピー**: `cs copy` でコードブロックをそのままクリップボードへ
- **パイプ対応**: `cs add --stdin` で標準入力からシートを登録
- **エディタ連携**: 環境変数 `$EDITOR` を使用（未設定時はvim）

## サンプル

`sample/` ディレクトリにサンプルのチートシートがあります：

```
sample/
├── en/           # 英語版
│   ├── cc-skills.md    # Claude Code スキル
│   ├── cs-help.md      # このCLIのヘルプ
│   ├── tmux.md         # tmux コマンド
│   └── vim.md          # Vim コマンド
└── ja/           # 日本語版
    ├── cc-skills.md
    ├── cs-help.md
    ├── tmux.md
    └── vim.md
```

### サンプルをチートシートに追加

```bash
# 日本語版サンプルを追加
cs add vim --file sample/ja/vim.md
cs add tmux --file sample/ja/tmux.md
cs add cc-skills --file sample/ja/cc-skills.md
cs add cs-help --file sample/ja/cs-help.md

# 英語版サンプルを追加
cs add vim --file sample/en/vim.md
cs add tmux --file sample/en/tmux.md
cs add cc-skills --file sample/en/cc-skills.md
cs add cs-help --file sample/en/cs-help.md
```

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
