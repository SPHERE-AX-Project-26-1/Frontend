<template>
  <main class="flex-1 px-9 py-8 w-full">

      <!-- 페이지 헤더 -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-[#1a1a2e]">이전 기록 조회</h1>
        </div>
        <button
          :class="isDeleteMode ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200'"
          class="flex items-center gap-2 px-4 py-2.5 border rounded-md text-sm font-medium cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition self-end -mb-3"
          @click="toggleDeleteMode"> 삭제
        </button>
      </div>

      <!-- 툴바 -->
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-3 mb-5">

        <!-- 검색창 -->
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-md px-3 py-2 flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="유역명으로 검색..."
            class="flex-1 outline-none text-sm text-gray-600 bg-transparent placeholder-gray-400"
          />
        </div>

        <!-- 정렬 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400 whitespace-nowrap">정렬</span>
          <div class="bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
            <select v-model="sortBy" class="text-sm text-[#2c3e6b] bg-transparent outline-none cursor-pointer font-medium">
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
            <select v-model="filterRegion" class="text-sm text-[#2c3e6b] bg-transparent outline-none cursor-pointer font-medium">
              <option value="">전체 지역</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
          </div>
        </div>

        <!-- 날짜 -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400 whitespace-nowrap">업로드 날짜</span>
          <div class="relative">
            <input v-model="filterDate" type="date" :class="filterDate ? 'text-[#2c3e6b]' : 'text-transparent'" class="bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm outline-none" />
            <span v-if="!filterDate" class="absolute inset-0 flex items-center px-3 text-sm text-[#2c3e6b] font-medium pointer-events-none">전체 기간</span>
          </div>
          <button v-if="filterDate" @click="filterDate = ''" class="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">초기화</button>
        </div>

        <!-- 총 건수 -->
        <span class="text-sm text-gray-500 whitespace-nowrap">총 {{ filteredVideos.length }}건</span>

      </div>

      <!-- 삭제 모드 안내 바 -->
      <div v-if="isDeleteMode" class="flex items-center justify-between bg-red-50 border border-red-200 rounded-md px-5 py-3 mb-5">
        <span class="text-sm text-red-600 font-medium">{{ selectedIds.length }}개 선택됨</span>
        <div class="flex gap-2">
          <button class="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition" @click="toggleDeleteMode">취소</button>
          <button
            :disabled="selectedIds.length === 0"
            class="px-4 py-2 text-sm text-white bg-red-500 rounded-md cursor-pointer hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
            @click="deleteSelected"
          >
            선택 삭제
          </button>
        </div>
      </div>

      <!-- 영상 그리드 -->
      <div v-if="filteredVideos.length > 0" class="grid grid-cols-4 gap-5">
        <div
          v-for="video in displayedVideos"
          :key="video.id"
          :class="[
            selectedIds.includes(video.id) ? 'ring-2 ring-red-400' : '',
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer hover:-translate-y-0.5 '
          ]"
          class="bg-white rounded-xl overflow-hidden border border-gray-200 transition"
          @click="handleCardClick(video)"
        >
          <!-- 카드 헤더 -->
          <div class="px-3.5 pt-3 pb-2 border-b border-gray-100">
            <div class="text-xs text-gray-400 mb-0.5">업로드 {{ video.uploadDate }}</div>
            <div class="text-base text-gray-600 font-bold truncate">{{ video.filename }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ video.date }} · {{ video.name }}</div>
          </div>

          <!-- 썸네일 -->
          <div class="relative bg-gray-100 h-36 flex items-center justify-center">
            <img
              v-if="video.thumbnailPath"
              :src="`http://localhost:8001/media/${video.thumbnailPath}`"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <span class="text-3xl text-gray-300 relative z-10">▶</span>
            <span
              v-if="getSeverity(video.skygazerCount) !== '보통'"
              :class="getSeverity(video.skygazerCount) === '위험' ? 'bg-red-500' : 'bg-yellow-400'"
              class="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            >
              ⚠ {{ getSeverity(video.skygazerCount) }}
            </span>
            <div
              v-if="isDeleteMode"
              class="absolute inset-0 bg-black/20 flex items-center justify-center"
              @click.stop="toggleSelect(video.id)"
            >
              <div :class="selectedIds.includes(video.id) ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300'"
                class="w-6 h-6 border-2 rounded flex items-center justify-center font-bold text-sm">
                <span v-if="selectedIds.includes(video.id)">✓</span>
              </div>
            </div>
          </div>

          <!-- 카드 푸터 -->
          <div class="px-3.5 py-2.5 flex items-center gap-2 text-sm">
            <div class="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-md">
              <span class="text-gray-500">강준치</span>
              <span :class="getSeverity(video.skygazerCount) === '위험' ? 'text-red-500' : getSeverity(video.skygazerCount) === '주의' ? 'text-yellow-500' : 'text-gray-700'"
                class="font-bold">{{ video.skygazerCount }}마리</span>
            </div>
            <span class="text-gray-300">/</span>
            <span class="text-gray-500">총 개체</span>
            <span class="font-medium text-gray-700">{{ video.totalCount }}마리</span>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="filteredVideos.length === 0" class="flex items-center justify-center py-24 text-gray-400 text-sm">
        검색 결과가 없습니다.
      </div>

      <!-- 무한스크롤 감지 (기본 상태에서만) -->
      <div ref="sentinel" class="h-px"></div>
      <div v-if="isLoading" class="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
        <span class="w-4 h-4 border-2 border-gray-300 border-t-[#2c3e6b] rounded-full animate-spin"></span>
        불러오는 중...
      </div>

    </main>

    <!-- 상세 분석 모달 -->
    <RecordModal
      v-if="showModal && activeVideo"
      :video="activeVideo"
      @close="closeModal"
    />
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import RecordModal from '../components/RecordModal.vue'
import { getVideoList, getRegionNames, deleteVideos, getVideoDetail } from '@/api/videoApi'

const videos = ref([])
const regions = ref([])

const searchQuery  = ref('')
const sortBy       = ref('date_desc')
const filterRegion = ref('')
const filterDate   = ref('')
const isDeleteMode = ref(false)
const selectedIds  = ref([])
const showModal    = ref(false)
const activeVideo  = ref(null)

function getSeverity(count) {
  if (count >= 10) return '위험'
  if (count >= 5)  return '주의'
  return '보통'
}

const filteredVideos = computed(() => {
  let result = [...videos.value]
  if (searchQuery.value)  result = result.filter(v => v.name?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (filterRegion.value) result = result.filter(v => v.name === filterRegion.value)
  if (sortBy.value === 'date_desc') result.sort((a, b) => b.date.localeCompare(a.date))
  else if (sortBy.value === 'date_asc') result.sort((a, b) => a.date.localeCompare(b.date))
  else if (sortBy.value === 'region')   result.sort((a, b) => a.name.localeCompare(b.name))
  return result
})

const isFiltered = computed(() =>
  !!searchQuery.value || !!filterRegion.value || sortBy.value !== 'date_desc' || !!filterDate.value
)

const PAGE_SIZE   = 8
const currentPage = ref(1)
const isLoading   = ref(false)
const sentinel    = ref(null)
let observer = null

async function fetchVideos() {
  const videoData = await getVideoList('', '', sortBy.value, 1, 100, filterDate.value)
  videos.value = videoData.items
  currentPage.value = 1
}

watch([searchQuery, filterRegion, sortBy], () => { currentPage.value = 1 })
watch(filterDate, fetchVideos)

const displayedVideos = computed(() =>
  isFiltered.value
    ? filteredVideos.value
    : filteredVideos.value.slice(0, currentPage.value * PAGE_SIZE)
)

const hasMore = computed(() =>
  !isFiltered.value && displayedVideos.value.length < filteredVideos.value.length
)

function loadMore() {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true
  setTimeout(() => { currentPage.value++; isLoading.value = false }, 500)
}

onMounted(async () => {
  const [, regionData] = await Promise.all([
    fetchVideos(),
    getRegionNames()
  ])
  regions.value = regionData.name

  await nextTick()
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) loadMore()
  }, { threshold: 0.1 })
  if (sentinel.value) observer.observe(sentinel.value)
})

onBeforeUnmount(() => { observer?.disconnect() })

async function handleCardClick(video) {
  if (isDeleteMode.value) toggleSelect(video.id)
  else await openModal(video.id)
}

async function openModal(id) {
  const detail = await getVideoDetail(id)
  activeVideo.value = { ...detail, nameAvg: detail.regionAvg }
  showModal.value = true
}

function closeModal()       { showModal.value = false; activeVideo.value = null }
function toggleDeleteMode() { isDeleteMode.value = !isDeleteMode.value; selectedIds.value = [] }
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}
async function deleteSelected() {
  if (!selectedIds.value.length) return
  if (!confirm(`${selectedIds.value.length}개의 영상을 삭제하시겠습니까?`)) return
  await deleteVideos(selectedIds.value)
  videos.value = videos.value.filter(v => !selectedIds.value.includes(v.id))
  toggleDeleteMode()
}
</script>
