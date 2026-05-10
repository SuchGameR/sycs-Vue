<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import {
  Rocket,
  Shield,
  Puzzle,
  ArrowRight,
  MessageCircle,
} from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const messages = ref([]);
const API_BASE = `/api`;
const socket = io("/", { path: "/socket.io" });
const router = useRouter();

const fetchPublicMessages = async () => {
  try {
    const res = await fetch(`${API_BASE}/messages/global?limit=10`);
    if (res.ok) {
      messages.value = await res.json();
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchPublicMessages();
  socket.on("public-message", (msg) => {
    messages.value.unshift(msg);
    if (messages.value.length > 20) messages.value.pop();
  });
});

onUnmounted(() => {
  socket.disconnect();
});

function goToSignin() {
  router.push("/signin");
}

function goToSignup() {
  router.push("/signup");
}
</script>

<template>
  <div class="landing">
    <!-- 左側: メインコンテンツ -->
    <div class="intro-section">
      <div class="hero">
        <img src="/svgLogoOutline.svg" class="hero-logo" alt="SYCS" />
        <h1 class="catchphrase">{{ authStore.t.description }}</h1>
        <h2 class="sub-catchphrase">{{ authStore.t.now_happening }}</h2>

        <div class="cta-buttons">
          <button class="cta-button primary" @click="goToSignup">
            {{ authStore.t.start_now }}
          </button>
          <div class="divider">
            <span>または</span>
          </div>
          <button class="cta-button secondary" @click="goToSignin">
            {{ authStore.t.signin }}
          </button>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <MessageCircle class="icon" />
          <p>リアルタイムな会話。</p>
        </div>
        <div class="feature-card">
          <Rocket class="icon" />
          <p>高速な体験を。</p>
        </div>
      </div>
    </div>

    <!-- 右側: パブリックタイムライン -->
    <div class="timeline-section">
      <div class="timeline-header">
        <h2>{{ authStore.t.public_timeline }}</h2>
      </div>
      <div class="message-list">
        <div v-if="messages.length === 0" class="no-messages">
          {{ authStore.t.now_loading }}
        </div>
        <div v-for="msg in messages" :key="msg.id" class="message-card">
          <img
            :src="msg.avatar_url || '/default-avatar.png'"
            class="msg-avatar"
          />
          <div class="msg-body">
            <div class="msg-meta">
              <span class="author">{{ msg.author_name }}</span>
              <span v-if="msg.author_handle" class="handle"
                >@{{ msg.author_handle }}</span
              >
              <span class="dot">·</span>
              <span class="time">{{
                new Date(msg.created_at).toLocaleTimeString()
              }}</span>
            </div>
            <div class="msg-content">{{ msg.content }}</div>
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
  background-color: var(--surface);
  color: var(--text-primary);
  overflow: hidden;
  background-color: var(--background);
}

.intro-section {
  overflow: auto;
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4rem;
  background: var(--background);
}

.hero-logo {
  width: 60px;
  margin-bottom: 3rem;
}

.catchphrase {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 2rem;
  line-height: 1.1;
  letter-spacing: -2px;
}

.sub-catchphrase {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 3rem;
}

.cta-buttons {
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cta-button {
  width: 100%;
  padding: 1rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.cta-button.primary {
  background-color: var(--accent);
  color: white;
}

.cta-button.primary:hover {
  filter: brightness(1.1);
}

.cta-button.secondary {
  background-color: transparent;
  color: var(--accent);
  border: 1px solid rgba(var(--accent-rgb), 0.3);
}

.cta-button.secondary:hover {
  background-color: rgba(var(--accent-rgb), 0.05);
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}

.features-grid {
  display: flex;
  gap: 2rem;
  margin-top: 4rem;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.feature-card .icon {
  width: 20px;
  color: var(--accent);
}

.timeline-section {
  flex: 0.8;
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--surface);

  /* added */
  transform: translateY(100px);
  border-top: 1px solid var(--border);
  border-top-left-radius: 20px;
}

.timeline-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.timeline-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
}

.message-list {
  flex: 1;
  overflow-y: auto;
}

@keyframes woosh {
  0% {
    transform: translateX(20px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-card {
  padding: 1.2rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  transition: background 0.2s;
  animation: woosh 0.3s ease forwards;
}

.message-card:hover {
  background: rgba(0, 0, 0, 0.02);
}

.msg-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.msg-body {
  flex: 1;
  min-width: 0;
}

.msg-meta {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
}

.author {
  font-weight: 800;
  color: var(--text-primary);
}

.handle,
.time,
.dot {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.msg-content {
  line-height: 1.5;
  word-break: break-word;
}

.no-messages {
  padding: 4rem;
  text-align: center;
  color: var(--text-secondary);
}

@media screen and (max-width: 1310px) {
  .catchphrase {
    font-size: 3.2rem;
    line-height: 4rem;
  }
}
@media (max-width: 1100px) {
  .hero-logo {
    margin: 0 auto;
    margin-top: 0px;
    margin-bottom: 3rem;
  }
  .hero {
    align-items: center;
    text-align: center;
  }
  .cta-buttons,
  .features-grid {
    margin: 0 auto;
    margin-top: 40px;
  }
  .landing {
    flex-direction: column;
    overflow-y: auto;
  }
  .intro-section {
    padding: 4rem 2rem;
    flex: none;
    height: auto;
  }
  .timeline-section {
    border-left: none;
    border-top: 1px solid var(--border);
    flex: none;
    height: auto;
    min-height: 500px;
  }
  .catchphrase {
    font-size: 3rem;
    width: 100%;
    text-align: center;
    max-width: 800px;
    margin: 0 auto 1.5rem;
  }
  .sub-catchphrase {
    text-align: center;
  }
}
</style>
