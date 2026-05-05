<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { io } from "socket.io-client";

const messages = ref([]);
const API_BASE = `http://${window.location.hostname}:3001/api`;
const router = useRouter();
const socket = io(`http://${window.location.hostname}:3001`);

const fetchPublicTimeline = async () => {
  try {
    const serversRes = await fetch(`${API_BASE}/servers`);
    if (serversRes.ok) {
      const servers = await serversRes.json();
      if (servers.length > 0) {
        const channelsRes = await fetch(`${API_BASE}/servers/${servers[0].id}/channels`);
        if (channelsRes.ok) {
          const channels = await channelsRes.json();
          if (channels.length > 0) {
            const msgsRes = await fetch(`${API_BASE}/channels/${channels[0].id}/messages`);
            if (msgsRes.ok) {
              messages.value = await msgsRes.json();
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch timeline:", err);
  }
};

onMounted(() => {
  fetchPublicTimeline();
  
  socket.on("public-message", (msg) => {
    messages.value.push(msg);
    // 最大表示件数を制限する場合（例: 最新20件）
    if (messages.value.length > 20) {
      messages.value.shift();
    }
  });
});

onUnmounted(() => {
  socket.disconnect();
});

function goToSignin() {
  router.push('/signin');
}
</script>

<template>
  <div class="landing">
    <div class="intro-section">
      <div class="intro-content">
        <img src="/svgLogoOutline.svg" alt="SYCS" class="logo" />
        <h1>SYCSへようこそ</h1>
        <p class="description">
          SYCS（シクス）は、シンプルで高速な次世代コミュニケーションプラットフォームです。<br>
          サーバーを作り、チャンネルを整え、仲間とリアルタイムに繋がることができます。
        </p>
        <div class="features">
          <div class="feature-item">
            <span class="icon">🚀</span>
            <div>
              <h3>高速なレスポンス</h3>
              <p>ストレスのないチャット体験を提供します。</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="icon">🛡️</span>
            <div>
              <h3>安全な設計</h3>
              <p>あなたのプライバシーを第一に考えています。</p>
            </div>
          </div>
        </div>
        <button class="cta-button" @click="goToSignin">今すぐ始める</button>
      </div>
    </div>
    
    <div class="timeline-section">
      <div class="timeline-header">
        <h2>パブリック・タイムライン</h2>
        <p>今この瞬間、世界で起きていること</p>
      </div>
      <div class="message-list">
        <div v-if="messages.length === 0" class="no-messages">
          メッセージがありません
        </div>
        <div v-for="msg in messages" :key="msg.id" class="message-card">
          <div class="msg-avatar"></div>
          <div class="msg-body">
            <div class="msg-meta">
              <span class="author">{{ msg.author_name }}</span>
              <span class="time">{{ new Date(msg.created_at).toLocaleTimeString() }}</span>
            </div>
            <div class="content">{{ msg.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--background);
  color: var(--text-primary);
  overflow: hidden;
}

.intro-section {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: linear-gradient(135deg, var(--primary) 0%, #000 100%);
  color: white;
}

.intro-content {
  max-width: 600px;
}

.logo {
  width: 80px;
  margin-bottom: 2rem;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  color: white;
}

.description {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-item .icon {
  font-size: 1.5rem;
}

.feature-item h3 {
  color: white;
  margin-bottom: 0.2rem;
}

.feature-item p {
  opacity: 0.7;
  font-size: 0.9rem;
}

.cta-button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  background-color: var(--accent);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.cta-button:hover {
  transform: scale(1.05);
  background-color: var(--light-accent);
}

.timeline-section {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  background: white;
  border-left: 1px solid rgba(0,0,0,0.1);
}

.timeline-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.timeline-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.timeline-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.03);
}

.msg-avatar {
  width: 40px;
  height: 40px;
  background: #ddd;
  border-radius: 50%;
  flex-shrink: 0;
}

.msg-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.author {
  font-weight: bold;
  font-size: 0.9rem;
}

.time {
  font-size: 0.75rem;
  color: #999;
}

.content {
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
}

.no-messages {
  text-align: center;
  color: #999;
  margin-top: 3rem;
}

@media (max-width: 1024px) {
  .landing {
    flex-direction: column;
    overflow-y: auto;
  }
  .intro-section, .timeline-section {
    flex: none;
    height: auto;
  }
  .intro-section {
    padding: 3rem 2rem;
  }
}
</style>
