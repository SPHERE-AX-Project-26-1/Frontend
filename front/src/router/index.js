import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from "@/layouts/DefaultLayout.vue";

import LoginPage from "@/pages/LoginPage.vue";
import RegisterPage from "@/pages/RegisterPage.vue";
import DashboardPage from "@/pages/DashboardPage.vue";
import RecordPage from "@/pages/RecordPage.vue";
import LogPage from "@/pages/LogPage.vue";
import StatPage from "@/pages/StatPage.vue";
import UploadPage from "@/pages/UploadPage.vue";
import RiverManagePage from "@/pages/RiverManagePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 로그인, 회원가입은 Header 없는 화면
    {
      path: "/",
      name: "login",
      component: LoginPage,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterPage,
    },

    // 로그인 후 화면들은 DefaultLayout 사용
    {
      path: "/app",
      component: DefaultLayout,
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: DashboardPage,
        },
        {
          path: "upload",
          name: "upload",
          component: UploadPage,
        },
        {
          path: "history",
          name: "history",
          component: RecordPage,
        },
        {
          path: "system-log",
          name: "system-log",
          component: LogPage,
        },
        {
          path: "analytics",
          name: "analytics",
          component: StatPage,
        },
        {
          path: "river",
          name: "river",
          component: RiverManagePage,
        },
      ],
    },
  ],
});

const publicPaths = ["/", "/register"];

router.beforeEach((to) => {
  const isLoggedIn = localStorage.getItem("currentUser");

  if (!publicPaths.includes(to.path) && !isLoggedIn) {
    return "/";
  }
});

export default router;
