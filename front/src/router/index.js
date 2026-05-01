import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import RecordPage from '@/pages/RecordPage.vue'
import LogPage from '@/pages/LogPage.vue'
import StatPage from '@/pages/StatPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LoginPage },
    { path: '/register', component: RegisterPage },
    {
      path: '/app',
      component: DefaultLayout,
      children: [
        { path: '/dashboard', name: 'dashboard', component: DashboardPage },
        { path: '/upload', name: 'upload', component: () => ({ template: '<main class="flex-1 px-9 py-8 max-w-6xl w-full mx-auto"><h1 class="text-2xl font-bold text-[#1a1a2e]">영상 업로드</h1><p class="mt-4 text-gray-400">준비 중입니다.</p></main>' }) },
        { path: '/history', name: 'history', component: RecordPage },
        { path: '/system-log', name: 'system-log', component: LogPage },
        { path: '/analytics', name: 'analytics', component: StatPage },
        { path: '/river', name: 'river', component: () => ({ template: '<main class="flex-1 px-9 py-8 max-w-6xl w-full mx-auto"><h1 class="text-2xl font-bold text-[#1a1a2e]">유역 관리</h1><p class="mt-4 text-gray-400">준비 중입니다.</p></main>' }) },
      ]
    },
  ],
})

const publicPaths = ['/', '/register']
router.beforeEach((to) => {
  if (!publicPaths.includes(to.path) && !localStorage.getItem('currentUser')) {
    return '/'
  }
})

export default router
