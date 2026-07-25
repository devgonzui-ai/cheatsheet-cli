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
| `cs` | インタラクティブモード: fzf風インクリメンタル検索→表示 |
| `cs add <name>` | チートシートを追加（$EDITORでエディタ起動、未設定ならvim） |
| `cs add <name> --file <path>` | 既存ファイルから追加 |
| `cs add <name> --stdin` | 標準入力から追加（例: `tldr tar \| cs add tar-tips --stdin`） |
| `cs add <name> --tag <tags>` | カンマ区切りのタグを付けて追加 |
| `cs fetch <topic>` | [cheat.sh](https://cheat.sh) からチートシートを取得して表示 |
| `cs fetch <topic> --save [name]` | cheat.sh から取得してローカルに保存 |
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
| `cs backup [--out <path>]` | 全シートを tar.gz にバックアップ |
| `cs restore <file>` | バックアップから復元 |
| `cs mcp` | AIエージェント用のMCPサーバーを起動（Claude Code / Claude Desktop など） |
| `cs config [key] [value]` | 設定の表示・変更（`editor`、`dir`） |
| `cs completion <shell>` | シェル補完スクリプトを出力（`zsh` / `bash`） |

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

### cheat.sh から取得

`cs fetch` は [cheat.sh](https://cheat.sh) からコミュニティのチートシートを取得します。APIキーは不要です。

```bash
# 保存せずに表示するだけ
cs fetch tar

# ローカルに保存（名前はトピックから生成。/ + . は - に畳まれる）
cs fetch tar --save
cs fetch python/lists --save        # "python-lists" として保存

# 名前を指定して、タグ付きで保存
cs fetch tar --save tar-tips --tag archive,cli

# 既存シートを上書き
cs fetch tar --save --force

# 取得してから Claude に整形させる
cs fetch git --save git-basics && cs refine git-basics
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
# 名前と内容から検索（内容マッチはgrep風にマッチ行を表示）
cs search commit

# fuzzy検索も対応（"gitcmd" で "git-commands" がヒット）
cs search gitcmd

# タグで検索
cs search --tag git

# キーワードとタグを組み合わせて検索
cs search commit --tag git
```

### インタラクティブモード

引数なしで `cs` を実行すると、fzf風のインクリメンタル検索（部分一致 + fuzzy）でシートを選んでそのまま表示できます。

```bash
cs
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

#### Claude Code スキル（MCPの代替）

`cs` CLI の使い方を Claude Code に教える[スキル](https://code.claude.com/docs/en/skills)も同梱しています:

```bash
mkdir -p ~/.claude/skills/cheatsheet-cli
cp "$(npm root -g)/@gonzui/csheet-cli/skill/SKILL.md" ~/.claude/skills/cheatsheet-cli/
```

## 機能

- **cheat.sh連携**: `cs fetch` でコミュニティのチートシートを取得（APIキー不要）
- **MCPサーバー**: `cs mcp` でチートシートをAIエージェントに公開
- **AI生成**: `cs gen` でトピックからチートシートを生成、`cs refine` で雑なメモを整形（Claude API）
- **Markdownレンダリング**: コードブロックのシンタックスハイライト、テーブルの整形、見出しの色分け
- **インタラクティブモード**: 引数なしの `cs` でfzf風インクリメンタル検索
- **全文検索**: 名前と内容から検索、マッチ行のgrep風表示とfuzzy名前検索に対応
- **タグ管理**: タグによるチートシートの整理・絞り込み
- **クリップボードコピー**: `cs copy` でコードブロックをそのままクリップボードへ
- **パイプ対応**: `cs add --stdin` で標準入力からシートを登録
- **エディタ連携**: 環境変数 `$EDITOR` を使用（未設定時はvim）
- **設定変更**: `cs config` でエディタ・データ保存先を変更可能
- **シェル補完**: コマンドとシート名のTab補完（`cs completion zsh|bash`）
- **バックアップ/復元**: `cs backup` で全シートを tar.gz に

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

### バックアップ・復元

```bash
# ./cheatsheet-backup-<タイムスタンプ>.tar.gz を作成
cs backup

# 出力先を指定（ファイルまたはディレクトリ）
cs backup --out ~/backups/

# 復元（既存データがある場合は --force が必要）
cs restore cheatsheet-backup-20260706-153005.tar.gz --force
```

### 設定

```bash
# 全設定を表示
cs config

# エディタをVS Codeに（$EDITORより優先）
cs config editor "code --wait"

# データ保存先を変更（Dropboxで同期する例）
cs config dir ~/Dropbox/cheatsheets

# 設定を削除
cs config editor --unset
```

設定ファイル自体は常に `~/.config/cheatsheet-cli/config.json` にあります。`dir` を変更しても既存シートは自動移動されないので、手動でコピーしてください。

### シェル補完

```bash
# zsh: ~/.zshrc に追加（compinit の後）
eval "$(cs completion zsh)"

# bash: ~/.bashrc に追加
eval "$(cs completion bash)"
```

サブコマンドとシート名を補完できます（例: `cs show g<Tab>`）。

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
