<template>
  <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-3 mb-5">

    <!-- 검색창 -->
    <div class="flex items-center bg-gray-50 border border-gray-100 rounded-md px-3 py-2 flex-1">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        placeholder="파일명으로 검색..."
        class="flex-1 outline-none text-sm text-gray-600 bg-transparent placeholder-gray-400"
      />
    </div>

    <!-- 정렬 -->
    <div class="flex items-center gap-1.5">
      <span class="text-xs text-gray-400 whitespace-nowrap">정렬</span>
      <div class="bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
        <select
          :value="sortBy"
          @change="$emit('update:sortBy', $event.target.value)"
          class="text-sm text-[#2c3e6b] bg-transparent outline-none cursor-pointer font-medium"
        >
          <option value="date_desc">최근 업로드 순</option>
          <option value="date_asc">오래된 순</option>
          <option value="region">지역별</option>
        </select>
      </div>
    </div>

    <!-- 지역 -->
    <div class="flex items-center gap-1.5">
      <span class="text-xs text-gray-400 whitespace-nowrap">지역</span>
      <div class="bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
        <select
          :value="filterRegion"
          @change="$emit('update:filterRegion', $event.target.value)"
          class="text-sm text-[#2c3e6b] bg-transparent outline-none cursor-pointer font-medium"
        >
          <option value="">전체 지역</option>
          <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </div>
    </div>

    <!-- 날짜 -->
    <div class="flex items-center gap-1.5">
      <span class="text-xs text-gray-400 whitespace-nowrap">날짜</span>
      <div class="bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
        <select class="text-sm text-[#2c3e6b] bg-transparent outline-none cursor-pointer font-medium">
          <option>전체 기간</option>
        </select>
      </div>
    </div>

    <!-- 총 건수 -->
    <span class="text-sm text-gray-500 whitespace-nowrap">총 {{ totalCount }}건</span>

  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,    // 검색어
  sortBy: String,         // 정렬 기준
  filterRegion: String,   // 선택된 지역
  regions: Array,         // 지역 목록
  totalCount: Number,     // 총 건수
})

defineEmits([
  'update:searchQuery',
  'update:sortBy',
  'update:filterRegion',
])
</script>
