<template>
  <main class="flex-1 px-9 py-8 max-w-6xl w-full mx-auto">
      <div class="flex items-center justify-between mb-7">
        <h1 class="text-2xl font-bold text-[#1a1a2e]">시스템 로그 기록</h1>
        <div class="flex items-center gap-3">
          <div class="bg-white border border-gray-200 rounded-md px-3 py-2">
            <select v-model="filterEventType" class="text-sm text-[#2c3e6b] bg-transparent outline-none cursor-pointer font-medium">
              <option value="">전체 이벤트</option>
              <option v-for="type in eventTypes" :key="type" :value="type">{{ eventTypeLabel(type) }}</option>
            </select>
          </div>
          <button
            class="flex items-center gap-1.5 px-4 py-2 bg-[#1e2d52] text-white text-sm font-medium rounded-md hover:bg-[#2c3e6b] transition cursor-pointer"
            @click="exportCSV"
          >
            CSV 다운로드
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl overflow-hidden border border-gray-200">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-[#f0f3fa] border-b-2 border-gray-200">
              <th class="px-5 py-3.5 text-sm font-bold text-[#1e2d52] text-left w-40">발생 일시</th>
              <th class="px-5 py-3.5 text-sm font-bold text-[#1e2d52] text-left w-32">이벤트 종류</th>
              <th class="px-5 py-3.5 text-sm font-bold text-[#1e2d52] text-left">상세 내용</th>
              <th class="px-5 py-3.5 text-sm font-bold text-[#1e2d52] text-left w-24">사용자</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="border-b border-gray-100 last:border-none hover:bg-gray-50 transition"
            >
              <td class="px-5 py-3.5 text-xs text-[#1e2d52] whitespace-nowrap">{{ log.datetime }}</td>
              <td class="px-5 py-3.5">
                <span :class="badgeClass(log.eventType)" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {{ eventTypeLabel(log.eventType) }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-sm text-[#1e2d52]">{{ log.detail }}</td>
              <td class="px-5 py-3.5 text-sm font-semibold text-[#2c3e6b]">{{ log.username }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSystemLogs } from '@/api/logApi'

const filterEventType = ref('')
const logs = ref([])

onMounted(async () => {
  const data = await getSystemLogs()
  logs.value = data.items
})

const EVENT_LABEL = {
  UPLOAD:   '파일 업로드',
  ANALYSIS: '분석 완료',
  DOWNLOAD: '파일 다운로드',
  LOGIN:    '로그인',
  LOGOUT:   '로그아웃',
  DELETE:   '영상 삭제',
}

function eventTypeLabel(type) {
  return EVENT_LABEL[type] ?? type
}

function badgeClass(eventType) {
  const map = {
    UPLOAD:   'bg-[#e8edf7] text-[#1e2d52]',
    ANALYSIS: 'bg-[#ddf0e8] text-[#2a7a56]',
    DOWNLOAD: 'bg-[#e0f0fb] text-[#2980b9]',
    LOGIN:    'bg-[#ede8f5] text-[#6248a0]',
    LOGOUT:   'bg-[#f0f3fa] text-[#7a8db3]',
    DELETE:   'bg-[#e6eaf4] text-[#3b4f82]',
  }
  return map[eventType] ?? 'bg-[#f0f3fa] text-[#7a8db3]'
}

const eventTypes = computed(() => [...new Set(logs.value.map(l => l.eventType))])

const filteredLogs = computed(() =>
  filterEventType.value
    ? logs.value.filter(l => l.eventType === filterEventType.value)
    : logs.value
)

function exportCSV() {
  const headers = ['발생 일시', '이벤트 종류', '상세 내용', '사용자']
  const rows = filteredLogs.value.map(l => [l.datetime, l.eventType, l.detail, l.username])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `system_log_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

</script>

