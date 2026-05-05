import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";

const app = createApp(App);

// Load
import Main from "./components/layouts/Main.vue";
import Sidebar from "./components/layouts/Sidebar.vue";
import List from "./components/layouts/List.vue";

// Components
app.component("Main", Main);
app.component("Sidebar", Sidebar);
app.component("List", List);

const pinia = createPinia();
app.use(pinia);
app.use(router);

// Fetch user if token exists
const authStore = useAuthStore();
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

if (authStore.token) {
  authStore.fetchUser();
}

app.mount("#app");
