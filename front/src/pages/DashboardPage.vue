<template>
  <main class="min-h-screen bg-[#F6FAFD] px-8 py-7">
    <div class="origin-top-left scale-[0.8] w-[125%]">
      <!-- 메인: 지도 중심 -->
      <section class="grid grid-cols-[1fr_360px] gap-5">
        <!-- 지도 영역 -->
        <div
          class="relative min-h-[610px] rounded-[32px] overflow-hidden bg-[#DFF0FA] border border-sky-100 shadow-sm">
          <!-- 카카오맵 -->
          <KakaoMap
            :rivers="filteredRivers"
            :selected-river="selectedRiver"
            @select-river="selectedRiver = $event" />

          <!-- 지도 상단 컨트롤 -->
          <div
            class="absolute left-6 right-6 top-6 z-20 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              class="flex flex-wrap items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-sm px-4 py-3">
              <button
                v-for="filter in riskFilters"
                :key="filter"
                class="rounded-full px-3 py-1.5 text-xs font-bold transition"
                :class="
                  selectedFilter === filter
                    ? 'bg-[#08243D] text-white'
                    : 'bg-white text-slate-500 hover:bg-sky-50'
                "
                @click="selectedFilter = filter">
                {{ filter }}
              </button>
            </div>
          </div>

          <!-- 선택 유역 플로팅 상세 패널 -->
          <aside
            v-if="selectedRiver"
            class="absolute right-6 bottom-6 z-30 w-[330px] rounded-[28px] bg-white/90 backdrop-blur-md border border-white shadow-xl p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="mt-2 text-xl font-extrabold text-[#08243D]">
                  {{ selectedRiver.name }}
                </h3>
                <p class="mt-1 text-sm text-slate-500">
                  {{ selectedRiver.address }}
                </p>
              </div>

              <span
                class="rounded-full px-3 py-1 text-xs font-extrabold"
                :class="getRiskBadge(selectedRiver.risk)">
                {{ selectedRiver.risk }}
              </span>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">위치 정보</p>
                <p class="mt-1 text-sm font-bold text-slate-700">
                  {{ selectedRiver.latitude }}, {{ selectedRiver.longitude }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">최근 분석일</p>
                <p class="mt-1 text-sm font-bold text-slate-700">
                  {{ selectedRiver.lastAnalyzedAt || "-" }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">누적 검출 수</p>
                <p class="mt-1 text-sm font-bold text-[#08243D]">
                  {{ selectedRiver.totalSkygazerCount }}마리
                </p>
              </div>

              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">관리 상태</p>
                <p class="mt-1 text-sm font-bold text-slate-700">
                  {{ selectedRiver.status || "-" }}
                </p>
              </div>
            </div>

            <div class="mt-5 flex gap-2">
              <button
                class="flex-1 rounded-2xl bg-[#08243D] py-3 text-sm font-bold text-white hover:bg-[#103A5D] transition"
                @click.stop="openRecordModal(selectedRiver)">
                자세히 보기
              </button>

              <button
                class="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-bold text-sky-600 hover:bg-sky-50 transition"
                @click.stop="goRecordPage(selectedRiver)">
                기록
              </button>
            </div>
          </aside>
        </div>

        <!-- 오른쪽 이벤트 패널 -->
        <aside
          class="rounded-[32px] bg-white text-[#08243D] p-6 shadow-sm min-h-[610px]">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="mt-2 text-xl font-extrabold">최근 분석 이벤트</h2>
              <p class="mt-1 text-xs text-slate-400">
                최근 업로드 영상 기준 4건
              </p>
            </div>

            <RouterLink
              to="/app/history"
              class="mt-2 bg-white text-xs font-bold text-[#334E68] hover:text-[#1F3A4D] transition">
              전체 보기
            </RouterLink>
          </div>

          <!-- 로딩 / 에러 -->
          <div v-if="isLoading" class="mt-6 text-sm text-slate-400">
            대시보드 데이터를 불러오는 중입니다.
          </div>

          <div v-else-if="errorMessage" class="mt-6 text-sm text-red-500">
            {{ errorMessage }}
          </div>

          <!-- 최근 분석 이벤트 타임라인 -->
          <div v-else class="mt-6">
            <div
              v-if="recentEvents.length === 0"
              class="text-sm text-slate-400">
              최근 분석 이벤트가 없습니다.
            </div>

            <div v-else class="relative">
              <div
                v-for="(event, index) in recentEvents"
                :key="event.id"
                class="relative grid grid-cols-[48px_14px_1fr] gap-3">
                <!-- 시간 -->
                <div class="pt-0.5 text-right">
                  <p class="text-[11px] font-bold leading-tight text-slate-500">
                    {{ formatShortDate(event.date) }}
                  </p>
                  <p class="mt-0.5 text-xs font-extrabold text-[#08243D]">
                    {{ getTime(event.uploadTime) }}
                  </p>
                </div>

                <!-- 선 + 점 -->
                <div class="relative flex justify-center">
                  <div
                    v-if="index !== recentEvents.length - 1"
                    class="absolute top-4 -bottom-6 w-px bg-sky-200"></div>

                  <span
                    class="relative z-10 mt-1 h-2.5 w-2.5 rounded-full ring-4 ring-[#F3FAFE]"
                    :class="getEventDot(event.risk)"></span>
                </div>

                <!-- 내용 -->
                <div class="pb-6">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h3 class="text-sm font-extrabold text-[#08243D]">
                        {{ event.name }}
                      </h3>

                      <p
                        class="mt-1.5 text-sm leading-relaxed text-slate-600"
                        v-html="getEventMessage(event)"></p>
                    </div>

                    <span
                      class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                      :class="getLightRiskBadge(event.risk)">
                      {{ event.risk }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TOP 3 리스트 -->
          <div class="mt-7 border-t border-sky-100 pt-6">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-extrabold text-[#08243D]">
                검출 빈도 TOP 3
              </h3>
            </div>

            <div v-if="topRivers.length === 0" class="text-sm text-slate-400">
              검출 빈도 데이터가 없습니다.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(river, index) in topRivers"
                :key="river.id"
                class="flex items-center justify-between rounded-2xl border border-sky-100 bg-[#F8FCFF] px-4 py-3">
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-extrabold text-[#08243D]">
                    {{ index + 1 }}
                  </span>

                  <div>
                    <p class="text-sm font-bold">
                      {{ river.name }}
                    </p>
                    <p class="text-xs text-slate-400">
                      {{ river.totalSkygazerCount }}마리 검출
                    </p>
                  </div>
                </div>

                <span
                  class="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  :class="getLightRiskBadge(river.risk)">
                  {{ river.risk }}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <!-- 하단 상태 바 -->
      <section
        class="mt-8 rounded-3xl bg-[#F3FAFE] border border-sky-100 shadow-sm px-6 py-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="item in statusItems"
            :key="item.label"
            class="relative pl-4">
            <div
              class="absolute left-0 top-0 bottom-0 w-1 rounded-full"
              :class="item.barColor"></div>

            <p class="text-xs font-semibold" :class="item.textColor">
              {{ item.label }}
            </p>

            <div class="mt-1 flex items-end gap-1">
              <p class="text-2xl font-extrabold text-[#08243D]">
                {{ item.value }}
              </p>
              <p class="mb-1 text-xs text-slate-400">
                {{ item.unit }}
              </p>
            </div>

            <p class="mt-1 text-xs text-slate-400">
              {{ item.description }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- 상세 분석 모달 -->
    <RecordModal
      v-if="showRecordModal && activeVideo"
      :video="activeVideo"
      @close="closeRecordModal" />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import RecordModal from "@/components/RecordModal.vue";
import KakaoMap from "@/components/KakaoMap.vue";

const router = useRouter();

const selectedFilter = ref("전체");
const riskFilters = ["전체", "위험", "주의", "보통"];

const showRecordModal = ref(false);
const activeVideo = ref(null);
const selectedRiver = ref(null);

const isLoading = ref(false);
const errorMessage = ref("");

const summary = ref({
  totalRiverCount: 0,
  detectedRiverCount: 0,
  dangerRiverCount: 0,
  totalSkygazerCount: 0,
});

const rivers = ref([]);
const recentEvents = ref([]);
const topRivers = ref([]);

/*
  API endpoint는 백엔드 실제 주소에 맞게 여기만 수정하면 됨.

  전체 요약 조회:
  GET /api/dashboard/summary

  대시보드 유역별 지도 마커 조회:
  GET /api/dashboard/rivers

  최근 분석 이벤트 조회:
  GET /api/videos/?sortBy=date_desc&page=1&pageSize=4

  검출 빈도 TOP3 조회:
  GET /api/dashboard/top-rivers
*/
const API = {
  summary: "/api/dashboard/summary",
  riverMarkers: "/api/dashboard/rivers",
  recentEvents: "/api/videos/?sortBy=date_desc&page=1&pageSize=4",
  topRivers: "/api/dashboard/top-rivers",
};

onMounted(() => {
  fetchDashboardData();
});

async function fetchDashboardData() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const [summaryData, riverMarkerData, recentEventData, topRiverData] =
      await Promise.all([
        fetchJson(API.summary),
        fetchJson(API.riverMarkers),
        fetchJson(API.recentEvents),
        fetchJson(API.topRivers),
      ]);

    summary.value = {
      totalRiverCount: summaryData.totalRiverCount ?? 0,
      detectedRiverCount: summaryData.detectedRiverCount ?? 0,
      dangerRiverCount: summaryData.dangerRiverCount ?? 0,
      totalSkygazerCount: summaryData.totalSkygazerCount ?? 0,
    };

    rivers.value = (riverMarkerData.items ?? []).map(normalizeRiverMarker);

    recentEvents.value = (recentEventData.items ?? [])
      .map(normalizeRecentEvent)
      .slice(0, 4);

    topRivers.value = (topRiverData.items ?? []).map(normalizeTopRiver);

    selectedRiver.value = rivers.value[0] ?? null;
  } catch (error) {
    console.error(error);
    errorMessage.value =
      "대시보드 데이터를 불러오지 못했습니다. 백엔드 서버 또는 API 주소를 확인해주세요.";
  } finally {
    isLoading.value = false;
  }
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} 요청 실패: ${response.status}`);
  }

  return response.json();
}

function normalizeRiverMarker(river) {
  return {
    id: river.id,
    name: river.name,
    address: river.address,
    latitude: river.latitude,
    longitude: river.longitude,
    lastAnalyzedAt: river.lastAnalyzedAt,
    totalSkygazerCount: river.totalSkygazerCount ?? 0,
    latestSkygazerCount: river.latestSkygazerCount ?? 0,
    risk: river.risk ?? "보통",
    status: river.status ?? getStatusByRisk(river.risk),
    latestVideoId: river.latestVideoId,
  };
}

function normalizeRecentEvent(event) {
  return {
    id: event.id,
    filename: event.filename,
    date: event.date,
    uploadDate: event.uploadDate,
    uploadTime: event.uploadTime,
    name: event.name,
    latitude: event.latitude,
    longitude: event.longitude,
    skygazerCount: event.skygazerCount ?? 0,
    totalCount: event.totalCount ?? 0,
    weather: event.weather,
    duration: event.duration,
    risk: getRiskByVideoCount(event.skygazerCount ?? 0),
  };
}

function normalizeTopRiver(river) {
  return {
    id: river.id,
    name: river.name,
    totalSkygazerCount: river.totalSkygazerCount ?? 0,
    risk: river.risk ?? "보통",
  };
}

const filteredRivers = computed(() => {
  if (selectedFilter.value === "전체") return rivers.value;

  return rivers.value.filter((river) => river.risk === selectedFilter.value);
});

const statusItems = computed(() => {
  return [
    {
      label: "전체 유역",
      value: summary.value.totalRiverCount,
      unit: "곳",
      description: "등록된 모니터링 유역",
      barColor: "bg-sky-300",
      textColor: "text-sky-500",
    },
    {
      label: "검출 유역",
      value: summary.value.detectedRiverCount,
      unit: "곳",
      description: "강준치 탐지 이력 존재",
      barColor: "bg-blue-400",
      textColor: "text-blue-500",
    },
    {
      label: "위험 유역",
      value: summary.value.dangerRiverCount,
      unit: "곳",
      description: "즉시 점검 필요",
      barColor: "bg-red-400",
      textColor: "text-red-500",
    },
    {
      label: "누적 탐지",
      value: summary.value.totalSkygazerCount,
      unit: "마리",
      description: "등록 영상 누적 기준",
      barColor: "bg-[#08243D]",
      textColor: "text-slate-500",
    },
  ];
});

function openRecordModal(river) {
  const latestVideo = recentEvents.value.find(
    (event) => event.id === river.latestVideoId,
  );

  if (latestVideo) {
    activeVideo.value = latestVideo;
    showRecordModal.value = true;
    return;
  }

  if (!river.latestVideoId) {
    alert(`${river.name}의 분석 기록이 없습니다.`);
    return;
  }

  activeVideo.value = {
    id: river.latestVideoId,
    name: river.name,
    riverName: river.name,
    address: river.address,
    latitude: river.latitude,
    longitude: river.longitude,
    date: river.lastAnalyzedAt,
    uploadDate: river.lastAnalyzedAt,
    uploadTime: river.lastAnalyzedAt,
    skygazerCount: river.latestSkygazerCount,
    totalSkygazerCount: river.totalSkygazerCount,
    risk: river.risk,
  };

  showRecordModal.value = true;
}

function closeRecordModal() {
  showRecordModal.value = false;
  activeVideo.value = null;
}

function goRecordPage(river) {
  router.push({
    path: "/app/history",
    query: { riverId: river.id, name: river.name },
  });
}

function getEventMessage(event) {
  if (event.skygazerCount > 0) {
    return `강준치 ${event.skygazerCount}마리 탐지${
      event.risk === "위험" ? "<br>- 집중 모니터링 필요" : ""
    }`;
  }

  return "강준치 탐지 없음";
}

function getRiskByVideoCount(count) {
  if (count >= 10) return "위험";
  if (count >= 5) return "주의";
  return "보통";
}

function getStatusByRisk(risk) {
  if (risk === "위험") return "즉시 점검 필요";
  if (risk === "주의") return "관찰 필요";
  return "안정";
}

function formatShortDate(date) {
  if (!date) return "-";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return date;

  return `${year.slice(2)}-${month}-${day}`;
}

function getTime(uploadTime) {
  if (!uploadTime) return "";

  return uploadTime.split(" ")[1] ?? "";
}

function getRiskBadge(risk) {
  if (risk === "위험") return "bg-red-100 text-red-500";
  if (risk === "주의") return "bg-yellow-100 text-yellow-600";
  return "bg-green-100 text-green-600";
}

function getEventDot(risk) {
  if (risk === "위험") return "bg-red-400";
  if (risk === "주의") return "bg-yellow-300";
  return "bg-green-400";
}

function getLightRiskBadge(risk) {
  if (risk === "위험") return "bg-red-50 text-red-500 border border-red-100";

  if (risk === "주의") {
    return "bg-amber-50 text-amber-600 border border-amber-100";
  }

  return "bg-emerald-50 text-emerald-600 border border-emerald-100";
}
</script>
