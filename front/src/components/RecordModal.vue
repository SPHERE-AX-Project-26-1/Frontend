<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click="emit('close')">
    <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-300" @click.stop>

      <!-- 헤더 -->
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <span class="text-base font-bold text-gray-900">{{ video.filename }}</span>
          <span :class="severityBadgeClass(video.ganjunchiCount)" class="text-xs font-bold px-2 py-0.5 rounded">
            {{ getSeverity(video.ganjunchiCount) }}
          </span>
        </div>
        <button class="text-gray-400 hover:text-gray-600 cursor-pointer transition" @click="emit('close')">✕</button>
      </div>

      <!-- 정보 태그 행 -->
      <div class="flex items-center gap-2 px-6 py-4 border-b border-gray-200 flex-wrap">
        <span class="border border-gray-300 rounded px-3 py-1 text-xs text-gray-600">{{ video.date }}</span>
        <span class="border border-gray-300 rounded px-3 py-1 text-xs text-gray-600">{{ video.region }} · {{ video.location }}</span>
        <span class="border border-gray-300 rounded px-3 py-1 text-xs text-gray-600">{{ video.weather }} · 18°C</span>
        <span class="border border-gray-300 rounded px-3 py-1 text-xs text-gray-600">영상 길이 {{ video.duration }}</span>
      </div>

      <!-- 메인 콘텐츠 (2열) -->
      <div class="grid grid-cols-2 gap-4 px-6 py-4">

        <!-- 좌측: 개체 분석 결과 -->
        <div class="border border-gray-200 rounded-lg p-5">
          <h3 class="text-sm font-bold text-gray-800">개체 분석 결과</h3>
          <p class="text-xs text-gray-400 mt-0.5 mb-5">탐지된 전체 개체 중 강준치 비율</p>

          <!-- 도넛 차트 -->
          <div class="flex justify-center mb-6">
            <div class="relative">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#1e2d52" stroke-width="22"
                  :stroke-dasharray="`${Math.max(0, getDonutDash(video.ganjunchiCount, video.totalCount) - 4)} ${CIRCUMFERENCE}`"
                  :stroke-dashoffset="-2"
                  transform="rotate(-90 80 80)"/>
                <circle v-if="video.ganjunchiCount > 0 && video.ganjunchiCount < video.totalCount"
                  cx="80" cy="80" r="60" fill="none" stroke="#e0e4eb" stroke-width="22"
                  :stroke-dasharray="`${Math.max(0, CIRCUMFERENCE - getDonutDash(video.ganjunchiCount, video.totalCount) - 4)} ${CIRCUMFERENCE}`"
                  :stroke-dashoffset="-(getDonutDash(video.ganjunchiCount, video.totalCount) + 2)"
                  transform="rotate(-90 80 80)"/>
                <circle v-if="video.ganjunchiCount === 0"
                  cx="80" cy="80" r="60" fill="none" stroke="#e0e4eb" stroke-width="22"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-bold text-gray-900">{{ video.ganjunchiCount }}</span>
                <span class="text-xs text-gray-500 mt-1">강준치</span>
              </div>
            </div>
          </div>

          <!-- 범례 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between py-2.5 px-4 border border-gray-200 rounded">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full bg-[#1e2d52] shrink-0"></span>
                <span class="text-sm font-bold text-gray-700">강준치</span>
              </div>
              <span class="text-sm text-gray-800"><span class="font-bold">{{ video.ganjunchiCount }}</span> <span class="text-gray-500">마리</span></span>
            </div>
            <div class="flex items-center justify-between py-2.5 px-4 border border-gray-200 rounded">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full bg-gray-300 shrink-0"></span>
                <span class="text-sm text-gray-700">기타 어종</span>
              </div>
              <span class="text-sm text-gray-800"><span class="font-bold">{{ video.totalCount - video.ganjunchiCount }}</span> <span class="text-gray-500">마리</span></span>
            </div>
            <div class="flex items-center justify-between py-2.5 px-4 border border-blue-200 bg-blue-50 rounded">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full bg-blue-400 shrink-0"></span>
                <span class="text-sm font-semibold text-blue-600">총 발견 개체</span>
              </div>
              <span class="text-sm text-blue-600"><span class="font-bold">{{ video.totalCount }}</span> 마리</span>
            </div>
          </div>
        </div>

        <!-- 우측: 영상 + 발견 시점 -->
        <div class="flex flex-col gap-3">

          <!-- 영상 플레이어 -->
          <div class="bg-gray-700 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-600 transition" style="min-height: 200px;">
            <span class="text-3xl text-white/60">▶</span>
            <span class="text-sm text-white/50">클릭하여 영상 재생</span>
          </div>

          <!-- 강준치 발견 시점 -->
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-gray-800">강준치 발견 시점</h4>
              <span class="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                총 {{ video.detectionRanges.length }}구간 탐지
              </span>
            </div>
            <div v-if="video.detectionRanges.length === 0" class="text-xs text-gray-400 py-1">발견 없음</div>
            <div v-else class="grid grid-cols-2 gap-2">
              <div v-for="(r, i) in video.detectionRanges" :key="i"
                class="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded px-2.5 py-2">
                <span class="text-gray-400 text-xs shrink-0">▷</span>
                <span class="text-xs text-gray-700 flex-1">{{ r.range }}</span>
                <span class="text-xs font-bold text-white bg-gray-600 rounded px-1.5 py-0.5 min-w-[20px] text-center shrink-0">{{ r.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 비교 카드 -->
      <div class="grid grid-cols-2 gap-4 px-6 pb-5">
        <div v-for="card in compareCards" :key="card.label" class="border border-gray-200 rounded-lg p-5">
          <h4 class="text-sm font-bold text-gray-800">{{ card.title }}</h4>
          <p class="text-xs text-gray-400 mt-0.5 mb-4">{{ card.desc }}</p>
          <div class="grid grid-cols-[1fr_auto_1fr] items-end gap-2 mb-4">
            <div>
              <p class="text-xs text-gray-500 mb-1.5">이 영상</p>
              <p class="text-2xl font-bold text-gray-900">{{ video.ganjunchiCount }}<span class="text-sm font-normal text-gray-500 ml-1">마리</span></p>
            </div>
            <span class="text-xs text-gray-400 pb-1.5">vs</span>
            <div class="text-right">
              <p class="text-xs text-gray-500 mb-1.5">{{ card.label }}</p>
              <p class="text-2xl font-bold text-gray-400">{{ card.avg }}<span class="text-sm font-normal text-gray-400 ml-1">마리</span></p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 mb-3">
            <div class="h-4 bg-[#1e2d52] rounded transition-all" :style="{ width: splitBarWidth(video.ganjunchiCount, card.avg) + '%' }"></div>
            <div class="h-4 bg-gray-200 rounded flex-1 transition-all"></div>
          </div>
          <span v-if="video.ganjunchiCount > card.avg" class="text-xs text-red-500 font-medium">
            ▲ {{ card.label }}보다 {{ percentAbove(video.ganjunchiCount, card.avg) }}% 많음
          </span>
          <span v-else class="text-xs text-green-500 font-medium">
            ✓ {{ card.label }} 이하입니다
          </span>
        </div>
      </div>

      <!-- 푸터 -->
      <div class="px-6 py-4 border-t border-gray-200">
        <span class="text-xs text-gray-400">담당자: {{ video.uploader }} · 업로드: {{ video.uploadTime }}</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  video: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const compareCards = computed(() => [
  { title: '유역 평균 대비', desc: `${props.video.region} 평균 강준치 발견 수와 비교`, label: '유역 평균', avg: props.video.regionAvg },
  { title: '올해 평균 대비', desc: '2026년 전체 영상 평균 발견 개체 수와 비교',          label: '올해 평균', avg: props.video.yearAvg  },
])

function getSeverity(count) {
  if (count >= 10) return '위험'
  if (count >= 5)  return '주의'
  return '보통'
}

function severityBadgeClass(count) {
  const s = getSeverity(count)
  if (s === '위험') return 'bg-red-500 text-white'
  if (s === '주의') return 'bg-orange-400 text-white'
  return 'bg-green-500 text-white'
}

function percentAbove(value, avg) {
  if (avg === 0) return 0
  return Math.round((value - avg) / avg * 100)
}

function splitBarWidth(value, other) {
  const total = value + other
  if (total === 0) return 50
  return Math.round((value / total) * 100)
}

const CIRCUMFERENCE = 2 * Math.PI * 60
function getDonutDash(ganjunchi, total) {
  if (total === 0) return 0
  return (ganjunchi / total) * CIRCUMFERENCE
}
</script>
