<div align="center">
  <a href="https://github.com/yyyg1114/SYCS">
      <img src="./Logo.svg" alt="SYCS Logo" width="200">
  </a>
  <br>
  <h1 align="center">Shinjuku Yamabuki Chat System (SYCS)</h1>
  <p align="center">
    <strong>拡張性と柔軟性を備えた、次世代のコミュニティ・コミュニケーションツール</strong>
  </p>
</div>

<br>

> [!IMPORTANT]
> **Work in Progress**: このプロジェクトは現在開発の初期段階にあります。仕様の変更や破壊的な更新が頻繁に行われる可能性があります。

---

## 📝 プロジェクト概要
**SYCS (Shinjuku Yamabuki Chat System)** は、モダンなWeb技術を用いた掲示板型のコミュニケーション・ソフトウェアです。
単なるチャットツールに留まらず、独自の「ローカル」と「グローバル」という概念を取り入れることで、情報の整理と円滑な交流を両立させることを目指しています。

### 核心概念：Local & Global
SYCSでは、ユーザーの体験を以下の2つのレイヤーで定義しています。

* **Local（ローカル）**: 
    ダイレクトメッセージ（DM）に代表される、閉鎖的でプライベートな交流タブです。特定の相手との親密な対話をサポートします。
* **Global（グローバル）**: 
    サーバー管理や共有チャットといった、開放的な交流タブです。コミュニティ全体での情報共有や大規模な議論に適しています。

---

## 🚀 実装中の機能
現在、以下の基幹機能を重点的に開発しています：

- [ ] **アカウント管理システム**: セキュアな認証とユーザー管理（現在注力中）
- [ ] **チャット機能**: リアルタイムなメッセージ送受信
- [ ] **ダイレクトメッセージ**: 1対1のプライベートな対話
- [ ] **通話機能**: WebRTCを用いた音声・映像コミュニケーション
- [ ] **サーバー機能**: 独自のコミュニティスペース構築
- [ ] **グローバル機能**: 開放的な交流空間の提供

---

## 🛠 技術スタック
フルスタックな開発環境として、最新のツールセットを採用しています。

### Frontend
- **Framework**: Vue.js (Pinia / SPA Architecture)
- **Build Tool**: Vite / vite-dev-plugins-tool
- **Styling**: CSS
- **Testing**: Vitest / jsdom

### Backend
- **Runtime**: Node.js
- **Framework**: Express / Socket.io
- **Real-time**: WebRTC / JSON Web Token (JWT)
- **Language**: TypeScript / JavaScript

### Infrastructure & Database
- **Database**: PostgreSQL (Postgre)
- **Tools**: Git / nodemon / cors / pg / dotenv / ESLint / Prettier

---

## 🗄 データベースの採用理由
本プロジェクトでは、データストアに **PostgreSQL** を選定しています。

### PostgreSQL & JSONB の活用
最大の理由は **JSONB形式** による柔軟なデータ管理です。テーブルごとにJSON形式を保持できるため、スキーマの制約を最小限に抑えつつ、Vue.js側からの操作で完結するような高度な拡張性を実現しています。

MySQL等の他DBと比較し、大容量のJSONデータに対する抽出のしやすさやパフォーマンスが、将来的な「プラグイン実装」において避けられない要件であったため、ポスグレの採用に至りました。

---

## 🏗 使用方法
現在は開発初期段階のため、必要な環境構成やインストール手順は未定です。準備が整い次第、こちらに追記いたします。

## 📜 クレジット
Special Thanks!

**Main Developer** (Origin): <a href="https://github.com/yyyg1114">yyyg1114</a>
