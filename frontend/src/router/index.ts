import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import About from "../pages/About.vue";
import Message from "../pages/Message.vue";
import Notice from "../pages/Notice.vue";
import Favorite from "../pages/Favorite.vue";
import Server from "../pages/Server.vue";
import Signup from "../pages/Signup.vue";
import Signin from "../pages/Signin.vue";
import UserProfile from "../pages/UserProfile.vue";
import PostDetail from "../pages/PostDetail.vue";
import TimelineMain from "../components/layouts/Main.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { 
      path: "/", 
      component: Home,
      children: [
        { path: "", component: TimelineMain },
        { path: "user/:handle", component: UserProfile },
        { path: "status/:id", component: PostDetail },
      ]
    },
    { path: "/about", component: About },
    { path: "/message", component: Message },
    { path: "/notice", component: Notice },
    { path: "/favorite", component: Favorite },
    { path: "/server/:id", component: Server },
    { path: "/server/:serverId/channel/:channelId", component: Server },
    { path: "/signup", component: Signup },
    { path: "/signin", component: Signin },
  ],
});

export default router;
