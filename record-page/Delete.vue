<template>
  <div
    v-if="visible"
    class="flex items-center justify-between bg-red-50 border border-red-200 rounded-md px-5 py-3 mb-5"
  >
    <span class="text-sm text-red-600 font-medium">{{ selectedCount }}개 선택됨</span>
    <div class="flex gap-2">
      <button
        class="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition"
        @click="$emit('cancel')"
      >
        취소
      </button>
      <button
        :disabled="selectedCount === 0"
        class="px-4 py-2 text-sm text-white bg-red-500 rounded-md cursor-pointer hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
        @click="$emit('delete')"
      >
        선택 삭제
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,       // 삭제 모드 활성화 여부
  selectedCount: Number,  // 선택된 영상 개수
})

defineEmits(['cancel', 'delete'])
</script>
