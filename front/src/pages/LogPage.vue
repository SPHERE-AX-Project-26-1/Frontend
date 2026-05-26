<template>
  <main class="flex-1 px-9 py-8 max-w-6xl w-full mx-auto">
      <h1 class="text-2xl font-bold text-[#1a1a2e] mb-7">시스템 로그 기록</h1>

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
              v-for="log in logs"
              :key="log.id"
              class="border-b border-gray-100 last:border-none hover:bg-gray-50 transition"
            >
              <td class="px-5 py-3.5 text-xs text-[#1e2d52] whitespace-nowrap">{{ log.datetime }}</td>
              <td class="px-5 py-3.5">
                <span :class="badgeClass(log.eventType)" class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                  {{ log.eventType }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-sm text-[#1e2d52]">{{ log.detail }}</td>
              <td class="px-5 py-3.5 text-sm font-semibold text-[#2c3e6b]">{{ log.user }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
</template>

<script setup>

// 목데이터 - 백엔드 연결 시 API로 교체
const logs = [
  { id: 1,  datetime: '2026-03-16 14:30', eventType: '파일 업로드',   detail: '낙동강A-12_2026-03-16.mp4 업로드 완료',       user: '사용자1' },
  { id: 2,  datetime: '2026-03-16 14:45', eventType: '분석 완료',     detail: '낙동강A-12_2026-03-16 분석 완료',             user: '시스템' },
  { id: 3,  datetime: '2026-03-16 15:00', eventType: '파일 다운로드', detail: '낙동강A-12_2026-03-16 데이터 다운로드',        user: '사용자3' },
  { id: 4,  datetime: '2026-03-16 15:30', eventType: '로그인',        detail: '시스템 접속',                                 user: '사용자2' },
  { id: 5,  datetime: '2026-03-16 16:10', eventType: '파일 업로드',   detail: '금호강K-03_2026-03-16.mp4 업로드 완료',       user: '사용자1' },
  { id: 6,  datetime: '2026-03-16 16:25', eventType: '분석 완료',     detail: '금호강K-03_2026-03-16 분석 완료',             user: '시스템' },
  { id: 7,  datetime: '2026-03-16 16:50', eventType: '영상 삭제',     detail: '신천S-07_2025-12-01.mp4 삭제',                user: '사용자1' },
  { id: 8,  datetime: '2026-03-16 17:00', eventType: '로그아웃',      detail: '시스템 접속 종료',                            user: '사용자2' },
  { id: 9,  datetime: '2026-03-15 09:10', eventType: '로그인',        detail: '시스템 접속',                                 user: '사용자1' },
  { id: 10, datetime: '2026-03-15 09:30', eventType: '파일 업로드',   detail: '금호강K-03_2026-03-15.mp4 업로드 완료',       user: '사용자1' },
  { id: 11, datetime: '2026-03-15 09:50', eventType: '분석 완료',     detail: '금호강K-03_2026-03-15 분석 완료',             user: '시스템' },
  { id: 12, datetime: '2026-03-15 10:15', eventType: '파일 다운로드', detail: '금호강K-03_2026-03-15 데이터 다운로드',        user: '사용자3' },
]

function badgeClass(eventType) {
  const map = {
    '파일 업로드':   'bg-[#e8edf7] text-[#1e2d52]',
    '분석 완료':     'bg-[#ddf0e8] text-[#2a7a56]',
    '파일 다운로드': 'bg-[#e0f0fb] text-[#2980b9]',
    '로그인':        'bg-[#ede8f5] text-[#6248a0]',
    '로그아웃':      'bg-[#f0f3fa] text-[#7a8db3]',
    '영상 삭제':     'bg-[#e6eaf4] text-[#3b4f82]',
  }
  return map[eventType] ?? 'bg-[#f0f3fa] text-[#7a8db3]'
}
</script>
