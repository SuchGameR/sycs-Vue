import { defineStore } from "pinia";
import { ref, computed } from "vue";

const translations = {
  ja: {
    home: "タイムライン",
    settings: "設定",
    signin: "サインイン",
    signup: "新規登録",
    signout: "ログアウト",
    username: "プロフィール",
    avatar_url: "アバターURL",
    header_url: "ヘッダー画像URL",
    language: "言語",
    timeline_mode: "タイムライン表示モード",
    scroll: "スクロールでロード",
    stream: "自動で流れる",
    save: "保存",
    back_to_home: "ホームに戻る",
    global: "おすすめ",
    local: "ローカル",
    follow: "フォロー中",
    recommend: "おすすめ",
    now_loading: "読み込み中...",
    no_more: "これ以上はありません",
    empty: "ポストがありません",
    new_post: "ポストする",
    whats_happening: "いまどうしてる？",
    post_btn: "ポストする",
    welcome: "SYCSへようこそ",
    description: "いま起きていることを見つけよう。",
    public_timeline: "おすすめタイムライン",
    now_happening: "いま、世界で起きていること",
    start_now: "アカウント作成",
    error_signin: "メールアドレスまたはパスワードが正しくありません",
    updated: "設定を更新しました",
    theme: "表示",
    theme_light: "デフォルト（ライト）",
    theme_dark: "ダーク",
    theme_dim: "ディム",
    message: "メッセージ",
    notice: "通知",
    favorite: "ブックマーク",
    add_server: "コミュニティ作成",
  },
  en: {
    home: "Timeline",
    settings: "Settings",
    signin: "Log in",
    signup: "Sign up",
    signout: "Log out",
    username: "Profile",
    avatar_url: "Avatar URL",
    header_url: "Header Image URL",
    language: "Language",
    timeline_mode: "Timeline Mode",
    scroll: "Infinite Scroll",
    stream: "Auto Stream",
    save: "Save",
    back_to_home: "Back to Home",
    global: "For you",
    local: "Local",
    follow: "Following",
    recommend: "Recommend",
    now_loading: "Loading...",
    no_more: "No more posts",
    empty: "No posts found",
    new_post: "Post",
    whats_happening: "What's happening?",
    post_btn: "Post",
    welcome: "Welcome to SYCS",
    description: "See what's happening in the world right now.",
    public_timeline: "Public Timeline",
    now_happening: "What's happening right now",
    start_now: "Create account",
    error_signin: "Invalid email or password",
    updated: "Settings updated",
    theme: "Display",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_dim: "Dim",
    message: "Messages",
    notice: "Notifications",
    favorite: "Bookmarks",
    add_server: "Create Community",
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
