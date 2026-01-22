# Claude Code Skills チートシート

## ビルトインコマンド

### 一般的な操作

| コマンド | 説明 |
|---------|------|
| /help | ヘルプを表示 |
| /exit | セッションを終了 |
| /clear | 会話履歴をクリア |
| /context | コンテキスト使用量を可視化 |
| /compact [instructions] | 会話をコンパクト化 |

### 設定・構成

| コマンド | 説明 |
|---------|------|
| /config | 設定インターフェースを開く |
| /status | バージョン、モデル、アカウント情報を表示 |
| /model | AIモデルの選択・変更 |
| /theme | カラーテーマの変更 |
| /permissions | パーミッション設定の表示・更新 |
| /plan | Plan Modeに直接進入 |

### プロジェクト・メモリ管理

| コマンド | 説明 |
|---------|------|
| /init | CLAUDE.mdでプロジェクトを初期化 |
| /memory | CLAUDE.mdメモリファイルを編集 |

### セッション管理

| コマンド | 説明 |
|---------|------|
| /rename <name> | 現在のセッションに名前を付ける |
| /resume [session] | セッションを再開 |
| /rewind | 会話またはコード変更を巻き戻す |
| /export [filename] | 会話をエクスポート |

### 追跡・分析

| コマンド | 説明 |
|---------|------|
| /cost | トークン使用統計を表示 |
| /stats | 日次使用量、セッション履歴を表示 |
| /usage | プラン使用制限を表示 |

### ツール・接続管理

| コマンド | 説明 |
|---------|------|
| /mcp | MCP接続とOAuth認証を管理 |
| /tasks | バックグラウンドタスク一覧 |
| /todos | 現在のTODO項目を表示 |
| /doctor | インストールの健全性チェック |

## キーボードショートカット

### 一般操作

| ショートカット | 機能 |
|--------------|------|
| Ctrl+C | 現在の入力/生成をキャンセル |
| Ctrl+D | セッションを終了 |
| Ctrl+L | ターミナル画面をクリア |
| Ctrl+O | 詳細出力をトグル |
| Ctrl+R | コマンド履歴を逆検索 |
| Ctrl+G | テキストエディタで開く |
| Ctrl+V | クリップボードから画像をペースト |
| Ctrl+B | バックグラウンド実行 |
| Esc + Esc | 会話/コード変更を巻き戻す |
| Shift+Tab | パーミッションモードをトグル |
| Alt+P | モデルを切り替え |
| Alt+T | 拡張思考をトグル |

### マルチラインモード

| 方法 | ショートカット |
|------|--------------|
| クイックエスケープ | \ + Enter |
| macOS | Option+Enter |
| ターミナル | Shift+Enter |
| 制御シーケンス | Ctrl+J |

### クイックコマンド

| 入力 | 動作 |
|------|------|
| / | スキルまたはコマンド |
| ! | Bashモード |
| @ | ファイルパス補完 |

## カスタムスキル

### スキルの保存場所

| 場所 | パス | 適用範囲 |
|------|------|---------|
| Personal | ~/.claude/skills/<skill-name>/SKILL.md | 全プロジェクト |
| Project | .claude/skills/<skill-name>/SKILL.md | 当該プロジェクト |

### SKILL.md の書式

| フィールド | 説明 |
|----------|------|
| name | スキル名（小文字、ハイフン、数字のみ） |
| description | スキルの説明 |
| disable-model-invocation: true | 自動実行を禁止 |
| user-invocable: false | ユーザー呼び出しを禁止 |
| allowed-tools | 使用可能なツールを制限 |
| context: fork | 分離環境で実行 |
| argument-hint | 引数ヒント |

### スキル作成例

```bash
# スキルディレクトリ作成
mkdir -p ~/.claude/skills/my-skill

# SKILL.md を作成
cat > ~/.claude/skills/my-skill/SKILL.md << 'SKILL'
---
name: my-skill
description: スキルの説明
---
スキルの内容...
SKILL
```

### スキル呼び出し

```
/my-skill [引数]
```
