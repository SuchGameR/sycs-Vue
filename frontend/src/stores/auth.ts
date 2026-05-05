import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);

  const isAuthenticated = computed(() => !!token.value);

  async function fetchUser() {
    if (!token.value) return;
    try {
      const response = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      if (response.ok) {
        user.value = await response.json();
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    }
  }

  async function signin(email, password) {
    const response = await fetch("http://localhost:3000/api/auth/signin", {
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
    const response = await fetch("http://localhost:3000/api/auth/signup", {
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
    const response = await fetch("http://localhost:3000/api/auth/settings", {
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

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  return {
    user,
    token,
    isAuthenticated,
    fetchUser,
    signin,
    signup,
    updateSettings,
    logout,
  };
});
