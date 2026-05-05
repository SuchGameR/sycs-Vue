import { defineStore } from "pinia";
import { ref, computed } from "vue";

const translations = {
  ja: {
    home: "ホーム",
    settings: "設定",
    signin: "サインイン",
    signup: "サインアップ",
    signout: "サインアウト",
    username: "ユーザー名",
    avatar_url: "アバターURL",
    header_url: "ヘッダー画像URL",
    language: "言語",
    timeline_mode: "タイムライン",
    scroll: "スクロールでロード",
    stream: "自動で流れる",
    save: "保存",
    back_to_home: "ホームに戻る",
    global: "グローバル",
    local: "ローカル",
    follow: "フォロー",
    recommend: "レコメンド",
    now_loading: "読み込み中...",
    no_more: "これ以上はありません",
    empty: "メッセージがありません",
    new_post: "新規ポスト",
    whats_happening: "今どうしてる？",
    post_btn: "ポストする",
    welcome: "SYCSへようこそ",
    description:
      "SYCS（シクス）は、シンプルで高速な次世代コミュニケーションプラットフォームです。<br>サーバーを作り、チャンネルを整え、仲間とリアルタイムに繋がることができます。",
    public_timeline: "パブリック・タイムライン",
    now_happening: "今この瞬間、世界で起きていること",
    start_now: "今すぐ始める",
    error_signin: "メールアドレスまたはパスワードが正しくありません",
    updated: "設定を更新しました",
    theme: "テーマ",
    theme_light: "ライト",
    theme_dark: "ダーク",
    theme_dim: "ディム",
    message: "メッセージ",
    notice: "通知",
    favorite: "お気に入り",
    add_server: "サーバーを追加",
  },
  en: {
    home: "Home",
    settings: "Settings",
    signin: "Sign In",
    signup: "Sign Up",
    signout: "Sign Out",
    username: "Username",
    avatar_url: "Avatar URL",
    header_url: "Header Image URL",
    language: "Language",
    timeline_mode: "Timeline",
    scroll: "Infinite Scroll",
    stream: "Auto Stream",
    save: "Save",
    back_to_home: "Back to Home",
    global: "Global",
    local: "Local",
    follow: "Follow",
    recommend: "Recommend",
    now_loading: "Loading...",
    no_more: "No more messages",
    empty: "No messages found",
    new_post: "New Post",
    whats_happening: "What's happening?",
    post_btn: "Post",
    welcome: "Welcome to SYCS",
    description:
      "SYCS is a simple and fast next-generation communication platform.<br>Create servers, organize channels, and connect with friends in real-time.",
    public_timeline: "Public Timeline",
    now_happening: "What's happening in the world right now",
    start_now: "Start Now",
    error_signin: "Invalid email or password",
    updated: "Settings updated",
    theme: "Theme",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_dim: "Dim",
    message: "Messages",
    notice: "Notifications",
    favorite: "Favorites",
    add_server: "Add Server",
  },
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const lang = ref(localStorage.getItem("lang") || "ja");
  const timelineMode = ref(localStorage.getItem("timelineMode") || "scroll");
  const theme = ref(localStorage.getItem("theme") || "light");
  const notificationCount = ref(0);

  const isAuthenticated = computed(() => !!token.value);
  const t = computed(() => translations[lang.value]);

  const API_BASE = `http://${window.location.hostname}:3001/api`;

  function setLang(newLang) {
    lang.value = newLang;
    localStorage.setItem("lang", newLang);
  }

  function setTheme(newTheme) {
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  }

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      if (response.ok) {
        user.value = await response.json();
        if (user.value.attributes?.theme) {
          setTheme(user.value.attributes.theme);
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    }
  }

  async function signin(email, password) {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Signin failed");
    user.value = data.user;
    token.value = data.token;
    localStorage.setItem("token", data.token);
  }

  async function signup(username, email, password) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Signup failed");
    user.value = data.user;
    token.value = data.token;
    localStorage.setItem("token", data.token);
  }

  async function updateSettings(settings) {
    if (!token.value) return;
    const response = await fetch(`${API_BASE}/auth/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Update failed");
    user.value = data;
  }

  async function uploadAvatar(file) {
    if (!token.value) return;
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_BASE}/auth/upload-avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed");
    user.value.avatar_url = data.avatar_url;
    return data.avatar_url;
  }

  async function uploadHeader(file) {
    if (!token.value) return;
    const formData = new FormData();
    formData.append("header", file);

    const response = await fetch(`${API_BASE}/auth/upload-header`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed");
    user.value.header_url = data.header_url;
    return data.header_url;
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  function setTimelineMode(mode) {
    timelineMode.value = mode;
    localStorage.setItem("timelineMode", mode);
  }

  function resetNotificationCount() {
    notificationCount.value = 0;
  }

  function incrementNotificationCount() {
    notificationCount.value++;
  }

  return {
    user,
    token,
    lang,
    t,
    isAuthenticated,
    timelineMode,
    theme,
    notificationCount,
    setLang,
    setTheme,
    setTimelineMode,
    resetNotificationCount,
    incrementNotificationCount,
    fetchUser,
    signin,
    signup,
    updateSettings,
    uploadAvatar,
    uploadHeader,
    logout,
  };
});
