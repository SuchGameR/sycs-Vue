import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import About from "../pages/About.vue";
import Message from "../pages/Message.vue";
import Notice from "../pages/Notice.vue";
import Favorite from "../pages/Favorite.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: Home },
    { path: "/about", component: About },
    { path: "/message", component: Message },
    { path: "/notice", component: Notice },
    { path: "/favorite", component: Favorite },
  ],
});

export default router;
