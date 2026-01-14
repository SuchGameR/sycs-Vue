<div align="center">
  <a href="https://github.com/yyyg1114/SYCS">
      <img src="/SYCS_Logo.svg" alt="SYCS Logo" width=200>
  </a>
<br>

<span style="font-size: 5em; padding-top: 40px;">Shinjuku Yamabuki Chat System</span>

</div>
<br>

> [!TIP]
> このリポジトリは [yyyg1114/SYCS](https://github.com/yyyg1114/SYCS) からの派生です。
> 構築が楽なのが特徴です。
> `npm`はインストールしていることが必須です。

> [!IMPORTANT]
> This application is Work in Progress!

## About
This application is a thread-based communication system.
このアプリケーションはスレッド型のコミュニケーションシステムを提供します。

It provides various features for smooth communication.
円滑なコミュニケーションのための様々な機能を提供します。

## Features / 実装機能

### 👥 Account & User / アカウント・ユーザー
- **User Authentication / ユーザー認証**
  - Sign up, Login, Logout functionality.
  - サインアップ、ログイン、ログアウト機能。
- **Profile Settings / プロフィール設定**
  - Customize username and avatar image.
  - ユーザー名、アバター画像のカスタマイズ。
- **Unique ID / ユニークID**
  - User management via UUID.
  - UUIDによるユーザー管理。

### 💬 Threads & Messages / スレッド・メッセージ
- **Real-time Chat / リアルタイムチャット**
  - Instant communication using Socket.io.
  - Socket.ioによるリアルタイム通信。
- **Thread Management / スレッド管理**
  - Create, edit, and delete threads.
  - 新規作成、編集、削除機能。
- **Advanced Messaging / 高機能メッセージ**
  - **Threaded Replies**: Visual connector lines (Discord/Reddit style).
  - **階層型リプライ**: 視覚的なコネクタ線によるスレッド表示（Discord/Reddit風）。
  - **Grouped Posts**: Compact display for consecutive messages from the same user.
  - **連続投稿のグループ化**: 同じユーザーの連続メッセージをコンパクトに表示。
  - **Action Buttons**: Optimized placement for Reply, Reaction, and Delete.
  - **アクションボタン**: 返信、リアクション、削除ボタンの最適化された配置。
  - **Quick Delete**: Shift+Click delete button to skip confirmation.
  - **Shift+削除**: 確認ダイアログをスキップするクイック削除機能。

### 📁 Media & Attachments / メディア・添付ファイル
- **File Upload / ファイルアップロード**
  - Support for images, videos, audio, and other files.
  - 画像、動画、音声、その他ファイルの添付に対応。
- **Previews / プレビュー機能**
  - Inline playback for images/videos, audio player, and download links.
  - 画像・動画のインライン再生/表示、音声ファイルのプレイヤー表示、その他ファイルのダウンロードリンク。

### 🎨 UI/UX Improvements / 改善
- **Modern Design / モダンなデザイン**
  - Clean and sophisticated interface.
  - 見やすく洗練されたインターフェース。
- **Drag & Drop / ドラッグ&ドロップ**
  - Support for file attachments and icon settings.
  - ファイル添付やアイコン設定でのD&D対応。
- **Startup Scripts / 起動スクリプト**
  - `起動構成.bat`: Automatic dependency installation. (依存関係の自動インストール)
  - `アプリケーション起動.bat`: Start server and client together. (サーバー・クライアントの一括起動)

## How to use
There are required environments to run this application.
However, since it is still in the early stages of development, they cannot be listed yet.

## Credits
As this project is still in the early stages of development, the frameworks, libraries, and programming languages used for the application cannot be specified at this time.
