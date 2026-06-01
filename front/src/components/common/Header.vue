<template>
  <header
    class="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between">
    <div class="flex items-center gap-15">
      <!-- 왼쪽 : 로고 + 시스템 이름 -->
      <div class="flex items-center gap-3">
        <img :src="logo" alt="logo" class="w-12 h-12 object-contain" />

        <div class="flex flex-col leading-tight">
          <p class="text-xs font-semibold text-slate-500 tracking-wide">
            SPHERE AX
          </p>
          <h1 class="text-sm font-bold text-slate-900 leading-snug">
            강준치 모니터링 시스템
          </h1>
        </div>
      </div>

      <!-- 메뉴 -->
      <nav class="flex gap-14 text-m font-semibold">
        <RouterLink
          v-for="menu in menus"
          :key="menu.path"
          :to="menu.path"
          class="transition-colors"
          :class="
            route.path === menu.path
              ? 'text-blue-900'
              : 'text-slate-600 hover:text-blue-900'
          ">
          {{ menu.name }}
        </RouterLink>
      </nav>
    </div>

    <!-- 오른쪽 -->
    <div class="flex items-center gap-3 text-sm text-slate-700">
      <span>{{ currentUser?.username || currentUser?.user_id }}</span>
      <span class="text-slate-300">|</span>
      <button
        class="hover:text-blue-900 transition cursor-pointer"
        @click="logout">
        로그아웃
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import logo from "../../assets/logo.jpg";
import { logout } from "../../api/authApi";

const route = useRoute();
const router = useRouter();

let stored = null;
try {
  stored = JSON.parse(localStorage.getItem("currentUser") || "null");
} catch {}
const currentUser = ref(stored);

function logout() {
  logout()
    .then(() => {
      localStorage.removeItem("accessToken");
      router.push("/");
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    });
}

const menus = [
  { name: "대시보드", path: "/app/dashboard" },
  { name: "영상 업로드", path: "/app/upload" },
  { name: "기록 조회", path: "/app/history" },
  { name: "통계 분석", path: "/app/analytics" },
  { name: "유역 관리", path: "/app/river" },
  { name: "시스템 로그", path: "/app/system-log" },
];
</script>
