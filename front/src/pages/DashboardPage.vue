<template>
  <main class="min-h-screen bg-[#F6FAFD] px-8 py-7">
    <div class="origin-top-left scale-[0.8] w-[125%]">
      <!-- 메인: 지도 중심 -->
      <section class="grid grid-cols-[1fr_360px] gap-5">
        <!-- 지도 영역 -->
        <div
          class="relative min-h-[610px] rounded-[32px] overflow-hidden bg-[#DFF0FA] border border-sky-100 shadow-sm">
          <!-- 임시 지도 배경 -->
          <div class="absolute inset-0">
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(125,211,252,0.45),transparent_35%)]"></div>

            <!-- 강/유역 느낌 선 -->
            <svg
              class="absolute inset-0 h-full w-full opacity-60"
              viewBox="0 0 1000 620"
              preserveAspectRatio="none">
              <path
                d="M120 520 C 220 430, 260 360, 390 340 C 520 320, 510 210, 650 190 C 760 175, 810 110, 930 80"
                fill="none"
                stroke="#7DD3FC"
                stroke-width="22"
                stroke-linecap="round" />
              <path
                d="M130 520 C 230 435, 270 365, 395 345 C 520 325, 515 215, 650 195 C 760 180, 810 115, 930 85"
                fill="none"
                stroke="#FFFFFF"
                stroke-width="8"
                stroke-linecap="round"
                opacity="0.7" />
              <path
                d="M250 190 C 320 240, 345 300, 400 340"
                fill="none"
                stroke="#BAE6FD"
                stroke-width="14"
                stroke-linecap="round" />
              <path
                d="M690 430 C 650 350, 630 260, 650 195"
                fill="none"
                stroke="#BAE6FD"
                stroke-width="14"
                stroke-linecap="round" />
            </svg>
          </div>

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

          <!-- 마커 -->
          <button
            v-for="river in filteredRivers"
            :key="river.id"
            class="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            :style="{ left: river.x + '%', top: river.y + '%' }"
            @click="selectedRiver = river">
            <span class="relative flex items-center justify-center">
              <span
                class="absolute rounded-full animate-ping opacity-25"
                :class="[
                  getMarkerColor(river.risk),
                  getMarkerPingSize(river.detectCount),
                ]"></span>
              <span
                class="relative rounded-full border-[5px] border-white shadow-xl transition hover:scale-125"
                :class="[
                  getMarkerColor(river.risk),
                  getMarkerSize(river.detectCount),
                ]"></span>
            </span>
          </button>

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
                  {{ selectedRiver.region }}
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
                <p class="text-xs text-slate-400">GPS</p>
                <p class="mt-1 text-sm font-bold text-slate-700">
                  {{ selectedRiver.gps }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">최근 분석일</p>
                <p class="mt-1 text-sm font-bold text-slate-700">
                  {{ selectedRiver.lastDate }}
                </p>
              </div>

              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">검출 수</p>
                <p class="mt-1 text-sm font-bold text-[#08243D]">
                  {{ selectedRiver.detectCount }}마리
                </p>
              </div>

              <div class="rounded-2xl bg-[#F4FAFE] p-3">
                <p class="text-xs text-slate-400">관리 상태</p>
                <p class="mt-1 text-sm font-bold text-slate-700">
                  {{ selectedRiver.status }}
                </p>
              </div>
            </div>

            <div class="mt-5 flex gap-2">
              <button
                class="flex-1 rounded-2xl bg-[#08243D] py-3 text-sm font-bold text-white hover:bg-[#103A5D] transition">
                상세 보기
              </button>
              <button
                class="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm font-bold text-sky-600 hover:bg-sky-50 transition">
                기록
              </button>
            </div>
          </aside>
        </div>

        <!-- 오른쪽 이벤트 패널 -->
        <aside
          class="rounded-[32px] bg-[#F3FAFE] text-[#08243D] p-6 shadow-sm min-h-[610px]">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="mt-2 text-xl font-extrabold">최근 분석 이벤트</h2>
            </div>

            <RouterLink
              :to="{ name: 'history' }"
              class="mt-2 bg-white text-xs font-bold text-[#334E68] hover:text-[#1F3A4D] transition">
              전체 보기
            </RouterLink>
          </div>

          <!-- 최근 분석 이벤트 타임라인 -->
          <div class="mt-6">
            <div class="relative">
              <div
                v-for="(event, index) in recentEvents"
                :key="event.id"
                class="relative grid grid-cols-[48px_14px_1fr] gap-3">
                <!-- 시간 -->
                <div class="pt-0.5 text-right">
                  <p class="text-[11px] font-bold leading-tight text-slate-500">
                    {{ event.date }}
                  </p>
                  <p class="mt-0.5 text-xs font-extrabold text-[#08243D]">
                    {{ event.time }}
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
                        {{ event.riverName }}
                      </h3>

                      <p
                        class="mt-1.5 text-sm leading-relaxed text-slate-600"
                        v-html="event.message"></p>
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

          <!-- TOP 3 얇은 리스트 -->
          <div class="mt-7 border-t border-white/10 pt-6">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-extrabold text-[#08243D]">
                검출 빈도 TOP 3
              </h3>
            </div>

            <div class="space-y-3">
              <div
                v-for="(river, index) in topRivers"
                :key="river.id"
                class="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
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
                      {{ river.detectCount }}마리 검출
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
      <!-- 상단 얇은 상태 바 -->
      <section
        class="mt-8 rounded-3xl bg-white border border-sky-100 shadow-sm px-6 py-4">
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
  </main>
</template>

<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

const selectedFilter = ref("전체");
const riskFilters = ["전체", "위험", "주의", "보통"];

const rivers = ref([
  {
    id: 1,
    name: "낙동강 A-12",
    region: "대구 북구",
    gps: "35.954, 128.694",
    lastDate: "2026-05-01",
    detectCount: 47,
    risk: "위험",
    status: "즉시 점검 필요",
    x: 34,
    y: 55,
  },
  {
    id: 2,
    name: "금호강 K-03",
    region: "대구 동구",
    gps: "35.882, 128.635",
    lastDate: "2026-05-01",
    detectCount: 31,
    risk: "주의",
    status: "관찰 필요",
    x: 58,
    y: 43,
  },
  {
    id: 3,
    name: "신천 S-07",
    region: "대구 중구",
    gps: "35.870, 128.601",
    lastDate: "2026-05-02",
    detectCount: 17,
    risk: "주의",
    status: "관찰 필요",
    x: 48,
    y: 67,
  },
  {
    id: 4,
    name: "달서천 D-05",
    region: "대구 달서구",
    gps: "35.846, 128.532",
    lastDate: "2026-05-02",
    detectCount: 5,
    risk: "보통",
    status: "안정",
    x: 74,
    y: 62,
  },
  {
    id: 5,
    name: "팔거천 P-02",
    region: "대구 북구",
    gps: "35.946, 128.570",
    lastDate: "2026-05-02",
    detectCount: 12,
    risk: "보통",
    status: "안정",
    x: 25,
    y: 32,
  },
  {
    id: 6,
    name: "동화천 H-04",
    region: "대구 동구",
    gps: "35.935, 128.651",
    lastDate: "2026-05-02",
    detectCount: 0,
    risk: "보통",
    status: "안정",
    x: 67,
    y: 28,
  },
]);

const selectedRiver = ref(rivers.value[0]);

const recentEvents = ref([
  {
    id: 1,
    riverName: "낙동강 A-12",
    date: "26.05.03",
    time: "14:32",
    message: "강준치 12마리 탐지<br>- 집중 모니터링 필요",
    risk: "위험",
  },
  {
    id: 2,
    riverName: "신천 S-07",
    date: "26.05.03",
    time: "13:10",
    message: "강준치 6마리 탐지",
    risk: "주의",
  },
  {
    id: 3,
    riverName: "금호강 K-03",
    date: "26.05.02",
    time: "11:48",
    message: "강준치 4마리 탐지",
    risk: "주의",
  },
  {
    id: 4,
    riverName: "달서천 D-05",
    date: "26.05.02",
    time: "09:24",
    message: "강준치 탐지 없음",
    risk: "보통",
  },
]);

const filteredRivers = computed(() => {
  if (selectedFilter.value === "전체") return rivers.value;

  return rivers.value.filter((river) => river.risk === selectedFilter.value);
});

const statusItems = computed(() => {
  const totalRiverCount = rivers.value.length;
  const detectedRiverCount = rivers.value.filter(
    (river) => river.detectCount > 0,
  ).length;
  const dangerRiverCount = rivers.value.filter(
    (river) => river.risk === "위험",
  ).length;
  const recentDetectCount = rivers.value.reduce(
    (sum, river) => sum + river.detectCount,
    0,
  );

  return [
    {
      label: "전체 유역",
      value: totalRiverCount,
      unit: "곳",
      description: "등록된 모니터링 유역",
      barColor: "bg-sky-300",
      textColor: "text-sky-500",
    },
    {
      label: "검출 유역",
      value: detectedRiverCount,
      unit: "곳",
      description: "강준치 탐지 이력 존재",
      barColor: "bg-blue-400",
      textColor: "text-blue-500",
    },
    {
      label: "위험 유역",
      value: dangerRiverCount,
      unit: "곳",
      description: "즉시 점검 필요",
      barColor: "bg-red-400",
      textColor: "text-red-500",
    },
    {
      label: "최근 7일 탐지",
      value: recentDetectCount,
      unit: "마리",
      description: "전주 대비 +18",
      barColor: "bg-[#08243D]",
      textColor: "text-slate-500",
    },
  ];
});

const topRivers = computed(() => {
  return [...rivers.value]
    .sort((a, b) => b.detectCount - a.detectCount)
    .slice(0, 3);
});

function getMarkerColor(risk) {
  if (risk === "위험") return "bg-red-400";
  if (risk === "주의") return "bg-yellow-400";
  return "bg-green-400";
}

function getMarkerSize(count) {
  if (count >= 40) return "h-8 w-8";
  if (count >= 20) return "h-7 w-7";
  if (count >= 10) return "h-6 w-6";
  return "h-5 w-5";
}

function getMarkerPingSize(count) {
  if (count >= 40) return "h-14 w-14";
  if (count >= 20) return "h-12 w-12";
  return "h-10 w-10";
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
