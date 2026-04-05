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

    <main class="flex-1 flex justify-center pt-14">
      <form class="w-full max-w-lg px-5 flex flex-col" @submit.prevent="handleRegister">
        <h1 class="text-3xl font-bold text-gray-900 mb-7">회원가입</h1>

        <!-- 아이디 -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <label for="userId" class="text-sm font-semibold text-gray-700">아이디</label>
            <span v-if="idCheckMessage" :class="idCheckResult ? 'text-green-500' : 'text-red-500'" class="text-xs">
              {{ idCheckMessage }}
            </span>
          </div>
          <div class="flex gap-2">
            <input
              id="userId"
              v-model="userId"
              type="text"
              placeholder="아이디 입력 (6-20자)"
              :class="idCheckMessage && !idCheckResult ? 'border-red-500' : 'border-gray-300'"
              class="flex-1 px-4 py-3.5 border rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
            />
            <button
              type="button"
              class="px-4 py-3.5 bg-[#2c3e6b] text-white rounded-md text-sm font-medium whitespace-nowrap hover:bg-[#1e2d52] transition cursor-pointer"
              @click="checkDuplicate"
            >
              중복 확인
            </button>
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <label for="password" class="text-sm font-semibold text-gray-700">비밀번호</label>
            <span v-if="passwordMessage" class="text-xs text-red-500">{{ passwordMessage }}</span>
          </div>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호 입력 (8-20자)"
            :class="passwordMessage ? 'border-red-500' : 'border-gray-300'"
            class="w-full px-4 py-3.5 border rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
          />
        </div>

        <!-- 비밀번호 확인 -->
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <label for="passwordConfirm" class="text-sm font-semibold text-gray-700">비밀번호 확인</label>
            <span v-if="passwordConfirmMessage" :class="passwordConfirmMatch ? 'text-green-500' : 'text-red-500'" class="text-xs">
              {{ passwordConfirmMessage }}
            </span>
          </div>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            placeholder="비밀번호 재입력"
            :class="passwordConfirmMessage && !passwordConfirmMatch ? 'border-red-500' : 'border-gray-300'"
            class="w-full px-4 py-3.5 border rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
          />
        </div>

        <!-- 이름 -->
        <div class="mb-4">
          <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">이름</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="이름을 입력해주세요"
            class="w-full px-4 py-3.5 border border-gray-300 rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
          />
        </div>

        <!-- 이메일 -->
        <div class="mb-4">
          <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">이메일 주소</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="이메일 주소를 입력해주세요"
            class="w-full px-4 py-3.5 border border-gray-300 rounded-md text-sm outline-none transition focus:border-[#5b6fd6] bg-white"
          />
        </div>

        <!-- 버튼 -->
        <div class="flex justify-center gap-3 mt-7">
          <RouterLink
            to="/"
            class="w-32 py-3.5 bg-[#dce6f7] text-[#5b6fd6] rounded-md text-sm font-bold text-center hover:bg-[#c8d9f2] transition"
          >
            이전
          </RouterLink>
          <button
            type="submit"
            class="w-32 py-3.5 bg-[#2c3e6b] text-white rounded-md text-sm font-medium hover:bg-[#1e2d52] transition cursor-pointer"
          >
            가입하기
          </button>
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
const passwordConfirm = ref('')
const name = ref('')
const email = ref('')

const idCheckMessage = ref('')
const idCheckResult = ref(false)
const passwordMessage = ref('')
const passwordConfirmMessage = ref('')
const passwordConfirmMatch = ref(false)

watch(userId, (val) => {
  idCheckResult.value = false
  if (val && (val.length < 6 || val.length > 20)) {
    idCheckMessage.value = '6-20자만 사용 가능합니다.'
  } else {
    idCheckMessage.value = ''
  }
})

watch(password, (val) => {
  if (val && (val.length < 8 || val.length > 20)) {
    passwordMessage.value = '8-20자만 사용 가능합니다.'
  } else {
    passwordMessage.value = ''
  }
  if (passwordConfirm.value) {
    passwordConfirmMessage.value = val !== passwordConfirm.value ? '비밀번호가 일치하지 않습니다.' : ''
  }
})

watch(passwordConfirm, (val) => {
  if (!val) {
    passwordConfirmMessage.value = ''
    passwordConfirmMatch.value = false
  } else if (val === password.value) {
    passwordConfirmMessage.value = '비밀번호가 일치합니다.'
    passwordConfirmMatch.value = true
  } else {
    passwordConfirmMessage.value = '비밀번호가 일치하지 않습니다.'
    passwordConfirmMatch.value = false
  }
})

// 임시 중복 확인 - 백엔드 연결 시 API로 교체 예정
const takenIds = ['admin', 'user1', 'test123']

function checkDuplicate() {
  if (!userId.value) {
    idCheckMessage.value = '아이디를 입력해주세요.'
    idCheckResult.value = false
    return
  }
  if (takenIds.includes(userId.value)) {
    idCheckMessage.value = '사용할 수 없는 아이디입니다.'
    idCheckResult.value = false
  } else {
    idCheckMessage.value = '사용 가능한 아이디입니다.'
    idCheckResult.value = true
  }
}

// 회원가입 처리 - 백엔드 연결 시 API로 교체 예정
function handleRegister() {
  if (userId.value.length < 6 || userId.value.length > 20) {
    alert('아이디는 6-20자로 입력해주세요.')
    return
  }
  if (!idCheckResult.value) {
    alert('아이디 중복 확인을 해주세요.')
    return
  }
  if (password.value.length < 8 || password.value.length > 20) {
    alert('비밀번호는 8-20자로 입력해주세요.')
    return
  }
  if (password.value !== passwordConfirm.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  if (!name.value || !email.value) {
    alert('이름과 이메일을 입력해주세요.')
    return
  }
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  users.push({ userId: userId.value, password: password.value, name: name.value, email: email.value })
  localStorage.setItem('users', JSON.stringify(users))
  router.push('/')
}
</script>
