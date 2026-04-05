<template>
  <div class="min-h-screen bg-[#F9FCFF] flex flex-col">
    <header class="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img :src="logo" alt="logo" class="w-12 h-12 object-contain" />
        <div class="flex flex-col leading-tight">
          <p class="text-xs font-semibold text-slate-500 tracking-wide">SPHERE AX</p>
          <h1 class="text-sm font-bold text-slate-900 leading-snug">강준치 모니터링 시스템</h1>
        </div>
      </div>
    </header>

    <main class="flex-1 flex justify-center pt-36">
      <form class="w-full max-w-lg px-5 flex flex-col gap-4" @submit.prevent="handleLogin">

        <div class="flex flex-col gap-2">
          <label for="userId" class="text-sm font-semibold text-gray-700">아이디</label>
          <input
            id="userId"
            v-model="userId"
            type="text"
            placeholder="아이디를 입력하세요."
            class="w-full px-4 py-3.5 border border-gray-300 rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm font-semibold text-gray-700">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호를 입력하세요."
            class="w-full px-4 py-3.5 border border-gray-300 rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
          />
        </div>

        <p v-if="loginError" class="text-sm text-red-500 text-center">{{ loginError }}</p>

        <button
          type="submit"
          class="w-full py-4 mt-4 bg-[#2c3e6b] text-white rounded-md text-base font-medium cursor-pointer hover:bg-[#1e2d52] transition"
        >
          로그인
        </button>

        <div class="text-center mt-4">
          <RouterLink to="/register" class="text-sm text-gray-500 hover:underline">회원가입</RouterLink>
        </div>

      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.jpg'

const router = useRouter()
const userId = ref('')
const password = ref('')
const loginError = ref('')

watch([userId, password], () => {
  loginError.value = ''
})

function handleLogin() {
  if (!userId.value) {
    loginError.value = '아이디를 입력해주세요.'
    return
  }
  if (!password.value) {
    loginError.value = '비밀번호를 입력해주세요.'
    return
  }
  let users = []
  try { users = JSON.parse(localStorage.getItem('users') || '[]') } catch { users = [] }
  const matched = users.find(
    (u) =>
      u.userId === userId.value && u.password === password.value
  )
  if (matched) {
    router.push('/dashboard')
  } else {
    loginError.value = '아이디 또는 비밀번호가 올바르지 않습니다.'
  }
}
</script>
