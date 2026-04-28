import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Load
import Main from "./components/layouts/Main.vue";
import Sidebar from "./components/layouts/Sidebar.vue";

// Components
app.component("Main", Main);
app.component("Sidebar", Sidebar);

app.use(createPinia());
app.use(router);

app.mount("#app");
