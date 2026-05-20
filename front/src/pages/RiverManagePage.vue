<template>
  <main class="flex-1 bg-[#F6FAFD] px-9 py-8 w-full min-h-screen">
    <!-- 페이지 헤더 -->
    <div class="flex items-start justify-end mb-6">
      <div class="ml-auto flex items-center gap-2">
        <label
          for="river-file-upload"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
          CSV/Excel 업로드
        </label>

        <input
          id="river-file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          class="hidden"
          @change="handleBulkUpload" />

        <button
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#08243D] text-white text-sm font-semibold hover:bg-[#103A5D] transition"
          @click="openCreateForm">
          <span class="text-lg leading-none">+</span>
          유역 추가
        </button>
      </div>
    </div>

    <section class="grid grid-cols-[1fr_420px] gap-5">
      <!-- 왼쪽: 유역 리스트 -->
      <div
        class="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-xl font-extrabold text-[#08243D]">유역 리스트</h2>
            <p class="mt-1 text-xs text-slate-400">
              총 {{ filteredRivers.length }}개의 유역이 조회되었습니다.
            </p>
          </div>
        </div>

        <!-- 검색 / 필터 / 정렬 -->
        <div class="flex items-center gap-2 mb-5">
          <div
            class="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="유역명 / 지역 검색"
              class="flex-1 outline-none text-sm text-slate-600 bg-transparent placeholder-slate-400" />
          </div>

          <select
            v-model="filterRisk"
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-[#2c3e6b] outline-none">
            <option value="">심각도 전체</option>
            <option value="위험">위험</option>
            <option value="주의">주의</option>
            <option value="보통">보통</option>
          </select>

          <select
            v-model="sortBy"
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-[#2c3e6b] outline-none">
            <option value="recent">최근 분석순</option>
            <option value="name">유역명순</option>
            <option value="risk">위험도순</option>
            <option value="count">누적 탐지순</option>
          </select>
        </div>

        <!-- 테이블 -->
        <div class="overflow-hidden rounded-2xl border border-slate-100">
          <table class="w-full text-sm">
            <thead class="bg-[#F4FAFE] text-slate-500">
              <tr>
                <th class="px-4 py-3 text-left font-bold">유역명</th>
                <th class="px-4 py-3 text-left font-bold">지역</th>
                <th class="px-4 py-3 text-left font-bold">GPS</th>
                <th class="px-4 py-3 text-left font-bold">위험도</th>
                <th class="px-4 py-3 text-left font-bold">누적 탐지</th>
                <th class="px-4 py-3 text-left font-bold">최근 분석일</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="river in filteredRivers"
                :key="river.id"
                class="border-t border-slate-100 cursor-pointer transition hover:bg-sky-50/60"
                :class="
                  selectedRiver?.id === river.id ? 'bg-sky-50' : 'bg-white'
                "
                @click="selectRiver(river)">
                <td class="px-4 py-4 font-extrabold text-[#08243D]">
                  {{ river.name }}
                </td>

                <td class="px-4 py-4 text-slate-600">
                  {{ river.region }}
                </td>

                <td class="px-4 py-4 text-xs text-slate-500">
                  {{ river.latitude }}, {{ river.longitude }}
                </td>

                <td class="px-4 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="getRiskBadge(river.risk)">
                    {{ river.risk }}
                  </span>
                </td>

                <td class="px-4 py-4 font-bold text-[#334E68]">
                  {{ river.totalGanjunchiCount }}마리
                </td>

                <td class="px-4 py-4 text-slate-500">
                  {{ river.lastAnalyzedAt || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredRivers.length === 0"
          class="py-20 text-center text-sm text-slate-400">
          검색 결과가 없습니다.
        </div>
      </div>

      <!-- 오른쪽: 상세보기 / 편집 / 등록 -->
      <aside
        class="bg-white border border-slate-200 rounded-[28px] shadow-sm p-6">
        <div class="flex items-start justify-between mb-5">
          <div>
            <h2 class="text-xl font-extrabold text-[#08243D]">
              {{ isCreateMode ? "새 유역 등록" : "상세보기 및 편집" }}
            </h2>

            <p v-if="!isCreateMode" class="mt-1 text-xs text-slate-400">
              영상 분석 목데이터 기준으로 집계된 정보입니다.
            </p>
          </div>

          <span
            v-if="!isCreateMode && form.risk"
            class="rounded-full px-3 py-1 text-xs font-bold"
            :class="getRiskBadge(form.risk)">
            {{ form.risk }}
          </span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">
              유역명
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="예: 낙동강 A-12"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">
              지역
            </label>
            <input
              v-model="form.region"
              type="text"
              placeholder="예: 대구 북구"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">
                위도
              </label>
              <input
                v-model="form.latitude"
                type="text"
                placeholder="35.910"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">
                경도
              </label>
              <input
                v-model="form.longitude"
                type="text"
                placeholder="128.584"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-600 mb-2">
              위험도
            </label>

            <div class="grid grid-cols-3 rounded-xl bg-slate-100 p-1">
              <button
                v-for="risk in riskOptions"
                :key="risk"
                class="rounded-lg py-2 text-sm font-bold transition"
                :class="
                  form.risk === risk
                    ? 'bg-white text-[#08243D] shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                "
                @click="form.risk = risk">
                {{ risk }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">
                주의 기준
              </label>
              <input
                v-model.number="form.cautionThreshold"
                type="number"
                min="0"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">
                위험 기준
              </label>
              <input
                v-model.number="form.dangerThreshold"
                type="number"
                min="0"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>

          <!-- 영상 분석 집계 -->
          <div
            v-if="!isCreateMode"
            class="grid grid-cols-3 gap-2 rounded-2xl bg-[#F6FAFD] border border-slate-100 p-3">
            <div>
              <p class="text-[11px] font-bold text-slate-400">분석 영상</p>
              <p class="mt-1 text-base font-extrabold text-[#08243D]">
                {{ form.analysisCount }}개
              </p>
            </div>

            <div>
              <p class="text-[11px] font-bold text-slate-400">누적 탐지</p>
              <p class="mt-1 text-base font-extrabold text-[#08243D]">
                {{ form.totalGanjunchiCount }}마리
              </p>
            </div>

            <div>
              <p class="text-[11px] font-bold text-slate-400">최근 탐지</p>
              <p class="mt-1 text-base font-extrabold text-[#08243D]">
                {{ form.latestGanjunchiCount }}마리
              </p>
            </div>
          </div>

          <!-- 카카오맵 지도 영역 -->
          <div
            class="relative h-[210px] rounded-2xl overflow-hidden border border-sky-100 bg-[#DFF0FA]">
            <KakaoMap
              :rivers="detailMapRivers"
              :selected-river="detailMapRiver"
              :enable-position-select="true"
              variant="compact"
              :map-level="7"
              @select-position="handleSelectPositionFromMap" />

            <div
              class="absolute left-3 bottom-3 z-20 rounded-xl bg-white/90 backdrop-blur-md border border-white px-3 py-2 shadow-sm pointer-events-none">
              <p class="text-xs font-extrabold text-[#08243D]">
                지도 클릭으로 GPS 좌표 선택
              </p>
              <p class="mt-0.5 text-[11px] text-slate-500">
                선택한 위치가 위도/경도에 자동 반영됩니다.
              </p>
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <button
              v-if="!isCreateMode"
              class="px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-500 hover:bg-red-100 transition"
              @click="deleteRiver">
              삭제
            </button>

            <div v-else></div>

            <div class="flex gap-2">
              <button
                class="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:bg-slate-50 transition"
                @click="resetForm">
                초기화
              </button>

              <button
                class="px-5 py-3 rounded-xl bg-[#08243D] text-sm font-bold text-white hover:bg-[#103A5D] transition"
                @click="saveRiver">
                저장
              </button>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import KakaoMap from "@/components/KakaoMap.vue";
import { mockVideos, riverCoordinates } from "@/data/mockVideos";

const riskOptions = ["보통", "주의", "위험"];

const RISK_STANDARD = {
  caution: 5,
  danger: 10,
};

const DEFAULT_POSITION = {
  latitude: 35.91,
  longitude: 128.584,
};

const rivers = ref(createRiversFromMockVideos(mockVideos));

const searchQuery = ref("");
const filterRisk = ref("");
const sortBy = ref("recent");

const selectedRiver = ref(null);
const isCreateMode = ref(false);

const emptyForm = {
  id: null,
  name: "",
  region: "",
  latitude: "",
  longitude: "",
  risk: "보통",
  lastAnalyzedAt: "",
  cautionThreshold: RISK_STANDARD.caution,
  dangerThreshold: RISK_STANDARD.danger,
  createdAt: "",
  analysisCount: 0,
  totalGanjunchiCount: 0,
  latestGanjunchiCount: 0,
};

const form = ref({ ...emptyForm });

onMounted(() => {
  if (rivers.value.length > 0) {
    selectRiver(rivers.value[0]);
  }
});

const filteredRivers = computed(() => {
  let result = [...rivers.value];

  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase();

    result = result.filter(
      (river) =>
        river.name.toLowerCase().includes(keyword) ||
        river.region.toLowerCase().includes(keyword),
    );
  }

  if (filterRisk.value) {
    result = result.filter((river) => river.risk === filterRisk.value);
  }

  if (sortBy.value === "recent") {
    result.sort((a, b) => b.lastAnalyzedAt.localeCompare(a.lastAnalyzedAt));
  } else if (sortBy.value === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === "risk") {
    const order = { 위험: 3, 주의: 2, 보통: 1 };
    result.sort((a, b) => order[b.risk] - order[a.risk]);
  } else if (sortBy.value === "count") {
    result.sort((a, b) => b.totalGanjunchiCount - a.totalGanjunchiCount);
  }

  return result;
});

const detailMapRiver = computed(() => {
  const latitude = Number(form.value.latitude);
  const longitude = Number(form.value.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return {
    id: form.value.id ?? "new-river",
    name: form.value.name || "선택 위치",
    region: form.value.region || "위치 미지정",
    latitude,
    longitude,
    risk: form.value.risk,
  };
});

const detailMapRivers = computed(() => {
  return detailMapRiver.value ? [detailMapRiver.value] : [];
});

function createRiversFromMockVideos(videos) {
  const grouped = videos.reduce((acc, video) => {
    const key = video.region;

    if (!acc[key]) {
      const [gpsLatitude = "-", gpsLongitude = "-"] = video.gps
        .split(",")
        .map((item) => item.trim());

      const coordinate = riverCoordinates?.[key];

      acc[key] = {
        id: key,
        name: video.region,
        region: video.location,
        latitude: coordinate?.latitude ?? gpsLatitude,
        longitude: coordinate?.longitude ?? gpsLongitude,
        videos: [],
      };
    }

    acc[key].videos.push(video);
    return acc;
  }, {});

  return Object.values(grouped).map((river, index) => {
    const sortedVideos = [...river.videos].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    const latestVideo = sortedVideos[0];

    const totalGanjunchiCount = river.videos.reduce(
      (sum, video) => sum + video.ganjunchiCount,
      0,
    );

    const latestGanjunchiCount = latestVideo?.ganjunchiCount ?? 0;

    return {
      id: index + 1,
      name: river.name,
      region: river.region,
      latitude: river.latitude,
      longitude: river.longitude,
      risk: getRiskByCount(latestGanjunchiCount),
      lastAnalyzedAt: latestVideo?.date ?? "-",
      cautionThreshold: RISK_STANDARD.caution,
      dangerThreshold: RISK_STANDARD.danger,
      createdAt: latestVideo?.uploadDate ?? latestVideo?.date ?? "-",
      analysisCount: river.videos.length,
      totalGanjunchiCount,
      latestGanjunchiCount,
    };
  });
}

function getRiskByCount(count) {
  if (count >= RISK_STANDARD.danger) return "위험";
  if (count >= RISK_STANDARD.caution) return "주의";
  return "보통";
}

function selectRiver(river) {
  selectedRiver.value = river;
  isCreateMode.value = false;
  form.value = { ...river };
}

function openCreateForm() {
  selectedRiver.value = null;
  isCreateMode.value = true;

  form.value = {
    ...emptyForm,
    id: Date.now(),
    createdAt: getToday(),
    lastAnalyzedAt: "-",
    latitude: DEFAULT_POSITION.latitude.toFixed(6),
    longitude: DEFAULT_POSITION.longitude.toFixed(6),
  };
}

function resetForm() {
  if (isCreateMode.value) {
    openCreateForm();
    return;
  }

  if (selectedRiver.value) {
    form.value = { ...selectedRiver.value };
  }
}

function saveRiver() {
  if (!form.value.name.trim() || !form.value.region.trim()) {
    alert("유역명과 지역 정보를 입력해주세요.");
    return;
  }

  if (!form.value.latitude || !form.value.longitude) {
    alert("GPS 좌표를 입력하거나 지도에서 위치를 선택해주세요.");
    return;
  }

  if (isCreateMode.value) {
    const newRiver = {
      ...form.value,
      id: Date.now(),
      createdAt: getToday(),
      lastAnalyzedAt: form.value.lastAnalyzedAt || "-",
      analysisCount: form.value.analysisCount || 0,
      totalGanjunchiCount: form.value.totalGanjunchiCount || 0,
      latestGanjunchiCount: form.value.latestGanjunchiCount || 0,
    };

    rivers.value.unshift(newRiver);
    selectRiver(newRiver);
    alert("새 유역이 등록되었습니다.");
    return;
  }

  const index = rivers.value.findIndex((river) => river.id === form.value.id);

  if (index !== -1) {
    rivers.value[index] = { ...form.value };
    selectedRiver.value = rivers.value[index];
    alert("유역 정보가 수정되었습니다.");
  }
}

function deleteRiver() {
  if (!selectedRiver.value) return;

  if (!confirm(`${selectedRiver.value.name} 유역을 삭제하시겠습니까?`)) {
    return;
  }

  rivers.value = rivers.value.filter(
    (river) => river.id !== selectedRiver.value.id,
  );

  if (rivers.value.length > 0) {
    selectRiver(rivers.value[0]);
  } else {
    openCreateForm();
  }
}

function handleSelectPositionFromMap(position) {
  form.value.latitude = position.latitude.toFixed(6);
  form.value.longitude = position.longitude.toFixed(6);
}

function handleBulkUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "csv") {
    alert(
      "현재 화면에서는 CSV 파일만 바로 반영됩니다. Excel 파일은 추후 백엔드 또는 xlsx 라이브러리 연동 후 처리할 수 있습니다.",
    );
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const text = reader.result;
    const rows = String(text)
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter(Boolean);

    const parsedRivers = rows
      .slice(1)
      .map((row, index) => {
        const [name, region, latitude, longitude, risk] = row
          .split(",")
          .map((cell) => cell.trim());

        if (!name || !region) return null;

        return {
          id: Date.now() + index,
          name,
          region,
          latitude: latitude || DEFAULT_POSITION.latitude.toFixed(6),
          longitude: longitude || DEFAULT_POSITION.longitude.toFixed(6),
          risk: riskOptions.includes(risk) ? risk : "보통",
          lastAnalyzedAt: "-",
          cautionThreshold: RISK_STANDARD.caution,
          dangerThreshold: RISK_STANDARD.danger,
          createdAt: getToday(),
          analysisCount: 0,
          totalGanjunchiCount: 0,
          latestGanjunchiCount: 0,
        };
      })
      .filter(Boolean);

    rivers.value = [...parsedRivers, ...rivers.value];

    if (parsedRivers.length > 0) {
      selectRiver(parsedRivers[0]);
    }

    alert(`${parsedRivers.length}개의 유역이 업로드되었습니다.`);
  };

  reader.readAsText(file, "UTF-8");
  event.target.value = "";
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function getRiskBadge(risk) {
  if (risk === "위험") return "bg-red-100 text-red-500 border border-red-100";
  if (risk === "주의") {
    return "bg-amber-50 text-amber-600 border border-amber-100";
  }
  return "bg-emerald-50 text-emerald-600 border border-emerald-100";
}
</script>
