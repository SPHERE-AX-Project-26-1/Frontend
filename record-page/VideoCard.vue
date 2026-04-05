<template>
  <div
    :class="[
      isSelected ? 'ring-2 ring-red-400' : '',
      isDeleteMode ? 'cursor-pointer' : 'cursor-pointer hover:-translate-y-0.5'
    ]"
    class="bg-white rounded-xl overflow-hidden border border-gray-200 transition"
    @click="$emit('click')"
  >
    <!-- 카드 헤더 -->
    <div class="px-3.5 pt-3 pb-2 border-b border-gray-100">
      <div class="text-xs text-gray-400 mb-0.5">업로드 {{ video.uploadDate }}</div>
      <div class="text-base text-gray-600 font-bold truncate">{{ video.filename }}</div>
      <div class="text-xs text-gray-400 mt-1">{{ video.date }} · {{ video.region }}</div>
    </div>

    <!-- 썸네일 -->
    <div class="relative bg-gray-100 h-36 flex items-center justify-center">
      <span class="text-3xl text-gray-300">▶</span>

      <!-- 위험도 뱃지 -->
      <span
        v-if="severity !== '정상'"
        :class="severity === '위험' ? 'bg-red-500' : 'bg-yellow-400'"
        class="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
      >
        ⚠ {{ severity }}
      </span>

      <!-- 삭제모드 체크박스 오버레이 -->
      <div
        v-if="isDeleteMode"
        class="absolute inset-0 bg-black/20 flex items-center justify-center"
        @click.stop="$emit('toggleSelect')"
      >
        <div
          :class="isSelected ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300'"
          class="w-6 h-6 border-2 rounded flex items-center justify-center font-bold text-sm"
        >
          <span v-if="isSelected">✓</span>
        </div>
      </div>
    </div>

    <!-- 카드 푸터 -->
    <div class="px-3.5 py-2.5 flex items-center gap-2 text-sm">
      <div class="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-md">
        <span class="text-gray-500">강준치</span>
        <span
          :class="severity === '위험' ? 'text-red-500' : severity === '주의' ? 'text-yellow-500' : 'text-gray-700'"
          class="font-bold"
        >
          {{ video.ganjunchiCount }}마리
        </span>
      </div>
      <span class="text-gray-300">/</span>
      <span class="text-gray-500">총 개체</span>
      <span class="font-medium text-gray-700">{{ video.totalCount }}마리</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  video: Object,           // 영상 데이터
  isDeleteMode: Boolean,   // 삭제 모드 여부
  isSelected: Boolean,     // 선택 여부
})

defineEmits(['click', 'toggleSelect'])

// 강준치 수에 따라 위험도 판단
const severity = computed(() => {
  if (props.video.ganjunchiCount >= 10) return '위험'
  if (props.video.ganjunchiCount >= 5) return '주의'
  return '정상'
})
</script>
