<template>
  <main class="flex-1 bg-[#F6FAFD] px-9 py-8 w-full min-h-screen">
    <!-- 페이지 헤더 -->
    <div class="flex items-start justify-end mb-6">
      <div class="ml-auto flex items-center gap-2">
        <label
          for="river-file-upload"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          :class="isUploading ? 'opacity-60 pointer-events-none' : ''">
          {{ isUploading ? "업로드 중..." : "CSV/Excel 업로드" }}
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

          <button
            class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
            @click="fetchRivers">
            새로고침
          </button>
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

        <div
          v-if="isLoading"
          class="py-20 text-center text-sm font-semibold text-slate-400">
          유역 목록을 불러오는 중입니다...
        </div>

        <!-- 테이블 -->
        <div v-else class="overflow-hidden rounded-2xl border border-slate-100">
          <table class="w-full text-sm">
            <thead class="bg-[#F4FAFE] text-slate-500">
              <tr>
                <th class="px-4 py-3 text-left font-bold">유역명</th>
                <th class="px-4 py-3 text-left font-bold">지역</th>
                <th class="px-4 py-3 text-left font-bold">좌표</th>
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
                  {{ river.address }}
                </td>

                <td class="px-4 py-4 text-xs text-slate-500">
                  {{ formatCoordinate(river.latitude) }},
                  {{ formatCoordinate(river.longitude) }}
                </td>

                <td class="px-4 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-bold"
                    :class="getRiskBadge(river.risk)">
                    {{ river.risk || "-" }}
                  </span>
                </td>

                <td class="px-4 py-4 font-bold text-[#334E68]">
                  {{ river.totalSkygazerCount ?? 0 }}마리
                </td>

                <td class="px-4 py-4 text-slate-500">
                  {{ river.lastAnalyzedAt || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!isLoading && filteredRivers.length === 0"
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

            <p
              v-if="!isCreateMode && form.createdAt"
              class="mt-1 text-xs text-slate-400">
              등록일 {{ form.createdAt }}
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
              v-model="form.address"
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
                type="number"
                step="0.0001"
                placeholder="35.9100"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-600 mb-2">
                경도
              </label>
              <input
                v-model="form.longitude"
                type="number"
                step="0.0001"
                placeholder="128.5840"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>

          <div v-if="!isCreateMode">
            <label class="block text-sm font-bold text-slate-600 mb-2">
              위험도
            </label>

            <div class="rounded-xl bg-slate-100 p-1">
              <div
                class="rounded-lg bg-white px-4 py-2 text-sm font-bold shadow-sm"
                :class="getRiskTextColor(form.risk)">
                {{ form.risk || "분석 전" }}
              </div>
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
                {{ form.analysisCount ?? 0 }}개
              </p>
            </div>

            <div>
              <p class="text-[11px] font-bold text-slate-400">누적 탐지</p>
              <p class="mt-1 text-base font-extrabold text-[#08243D]">
                {{ form.totalSkygazerCount ?? 0 }}마리
              </p>
            </div>

            <div>
              <p class="text-[11px] font-bold text-slate-400">최근 탐지</p>
              <p class="mt-1 text-base font-extrabold text-[#08243D]">
                {{ form.latestSkygazerCount ?? 0 }}마리
              </p>
            </div>
          </div>

          <!-- 지도 영역 -->
          <div
            class="relative h-[190px] rounded-2xl bg-[#DFF0FA] overflow-hidden border border-sky-100 cursor-crosshair"
            @click="handleMapClick">
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(125,211,252,0.45),transparent_35%)]"></div>

            <svg
              class="absolute inset-0 h-full w-full opacity-70"
              viewBox="0 0 500 220"
              preserveAspectRatio="none">
              <path
                d="M45 185 C 110 145, 135 118, 205 112 C 275 106, 285 70, 350 58 C 405 48, 430 30, 475 20"
                fill="none"
                stroke="#7DD3FC"
                stroke-width="15"
                stroke-linecap="round" />
              <path
                d="M50 185 C 112 148, 138 121, 207 116 C 277 110, 287 73, 352 62 C 407 52, 432 34, 475 24"
                fill="none"
                stroke="#FFFFFF"
                stroke-width="5"
                stroke-linecap="round"
                opacity="0.75" />
              <path
                d="M125 60 C 155 82, 180 100, 205 112"
                fill="none"
                stroke="#BAE6FD"
                stroke-width="10"
                stroke-linecap="round" />
              <path
                d="M350 165 C 335 120, 338 90, 350 58"
                fill="none"
                stroke="#BAE6FD"
                stroke-width="10"
                stroke-linecap="round" />
            </svg>

            <div
              v-if="form.mapX && form.mapY"
              class="absolute -translate-x-1/2 -translate-y-1/2"
              :style="{ left: form.mapX + '%', top: form.mapY + '%' }">
              <span class="relative flex items-center justify-center">
                <span
                  class="absolute h-10 w-10 rounded-full opacity-25 animate-ping"
                  :class="getMarkerColor(form.risk)"></span>
                <span
                  class="relative h-5 w-5 rounded-full border-4 border-white shadow-lg"
                  :class="getMarkerColor(form.risk)"></span>
              </span>
            </div>

            <div
              class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <p class="text-sm font-extrabold text-[#08243D]">
                지도 클릭으로 좌표 선택
              </p>
              <p class="mt-1 text-xs text-slate-500">
                또는 위도/경도를 직접 입력할 수 있습니다.
              </p>
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <button
              v-if="!isCreateMode"
              class="px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-500 hover:bg-red-100 transition disabled:opacity-60"
              :disabled="isSaving"
              @click="deleteRiver">
              삭제
            </button>

            <div v-else></div>

            <div class="flex gap-2">
              <button
                class="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:bg-slate-50 transition disabled:opacity-60"
                :disabled="isSaving"
                @click="resetForm">
                초기화
              </button>

              <button
                class="px-5 py-3 rounded-xl bg-[#08243D] text-sm font-bold text-white hover:bg-[#103A5D] transition disabled:opacity-60"
                :disabled="isSaving"
                @click="saveRiver">
                {{ isSaving ? "저장 중..." : "저장" }}
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

const RIVER_API = "/api/rivers/";
const RIVER_UPLOAD_API = "/api/rivers/upload";

const RISK_STANDARD = {
  caution: 5,
  danger: 10,
};

const rivers = ref([]);

const searchQuery = ref("");
const filterRisk = ref("");
const sortBy = ref("recent");

const selectedRiver = ref(null);
const isCreateMode = ref(false);

const isLoading = ref(false);
const isSaving = ref(false);
const isUploading = ref(false);

const emptyForm = {
  id: null,
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  risk: "보통",
  lastAnalyzedAt: "",
  cautionThreshold: RISK_STANDARD.caution,
  dangerThreshold: RISK_STANDARD.danger,
  createdAt: "",
  mapX: 50,
  mapY: 50,
  analysisCount: 0,
  totalSkygazerCount: 0,
  latestSkygazerCount: 0,
};

const form = ref({ ...emptyForm });

onMounted(() => {
  fetchRivers();
});

const filteredRivers = computed(() => {
  let result = [...rivers.value];

  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase();

    result = result.filter((river) => {
      const name = river.name?.toLowerCase() ?? "";
      const address = river.address?.toLowerCase() ?? "";

      return name.includes(keyword) || address.includes(keyword);
    });
  }

  if (filterRisk.value) {
    result = result.filter((river) => river.risk === filterRisk.value);
  }

  if (sortBy.value === "recent") {
    result.sort((a, b) => {
      const dateA = a.lastAnalyzedAt || "";
      const dateB = b.lastAnalyzedAt || "";
      return dateB.localeCompare(dateA);
    });
  } else if (sortBy.value === "name") {
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sortBy.value === "risk") {
    const order = { 위험: 3, 주의: 2, 보통: 1 };
    result.sort((a, b) => (order[b.risk] ?? 0) - (order[a.risk] ?? 0));
  } else if (sortBy.value === "count") {
    result.sort(
      (a, b) => (b.totalSkygazerCount ?? 0) - (a.totalSkygazerCount ?? 0),
    );
  }

  return result;
});

async function fetchRivers() {
  isLoading.value = true;

  try {
    const data = await requestApi(RIVER_API);

    rivers.value = normalizeRiverList(data?.items ?? []);

    if (rivers.value.length > 0) {
      await selectRiver(rivers.value[0]);
    } else {
      openCreateForm();
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "유역 목록을 불러오지 못했습니다.");
  } finally {
    isLoading.value = false;
  }
}

async function fetchRiverDetail(id) {
  const data = await requestApi(`${RIVER_API}${id}`);
  return normalizeRiver(data);
}

async function selectRiver(river) {
  selectedRiver.value = river;
  isCreateMode.value = false;

  try {
    const detail = await fetchRiverDetail(river.id);
    selectedRiver.value = detail;
    form.value = { ...detail };
  } catch (error) {
    console.error(error);
    form.value = { ...river };
    alert(
      error.message ||
        "유역 상세 정보를 불러오지 못했습니다. 목록 정보로 표시합니다.",
    );
  }
}

function openCreateForm() {
  selectedRiver.value = null;
  isCreateMode.value = true;
  form.value = {
    ...emptyForm,
    createdAt: "",
    lastAnalyzedAt: "",
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

async function saveRiver() {
  if (!validateForm()) return;

  isSaving.value = true;

  const payload = {
    name: form.value.name.trim(),
    address: form.value.address.trim(),
    latitude: Number(form.value.latitude),
    longitude: Number(form.value.longitude),
    cautionThreshold: Number(form.value.cautionThreshold),
    dangerThreshold: Number(form.value.dangerThreshold),
  };

  console.log("SAVE RIVER REQUEST", {
    url: isCreateMode.value ? RIVER_API : `${RIVER_API}${form.value.id}`,
    method: isCreateMode.value ? "POST" : "PUT",
    payload,
  });

  try {
    if (isCreateMode.value) {
      const created = await requestApi(RIVER_API, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const normalizedCreated = normalizeRiver(created);

      await fetchRivers();

      if (normalizedCreated.id) {
        await selectRiver(normalizedCreated);
      }

      alert("새 유역이 등록되었습니다.");
      return;
    }

    const updated = await requestApi(`${RIVER_API}${form.value.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const normalizedUpdated = normalizeRiver(updated);

    const index = rivers.value.findIndex(
      (river) => river.id === normalizedUpdated.id,
    );

    if (index !== -1) {
      rivers.value[index] = {
        ...rivers.value[index],
        ...normalizedUpdated,
      };
    }

    selectedRiver.value = normalizedUpdated;
    form.value = { ...normalizedUpdated };

    alert("유역 정보가 수정되었습니다.");
  } catch (error) {
    console.error(error);
    alert(error.message || "유역 저장에 실패했습니다.");
  } finally {
    isSaving.value = false;
  }
}

async function deleteRiver() {
  if (!selectedRiver.value) return;

  if (!confirm(`${selectedRiver.value.name} 유역을 삭제하시겠습니까?`)) {
    return;
  }

  isSaving.value = true;

  try {
    const data = await requestApi(`${RIVER_API}${selectedRiver.value.id}`, {
      method: "DELETE",
    });

    alert(data?.message || "유역이 삭제되었습니다.");

    rivers.value = rivers.value.filter(
      (river) => river.id !== selectedRiver.value.id,
    );

    if (rivers.value.length > 0) {
      await selectRiver(rivers.value[0]);
    } else {
      openCreateForm();
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "유역 삭제에 실패했습니다.");
  } finally {
    isSaving.value = false;
  }
}

function handleMapClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();

  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  form.value.mapX = Number(x.toFixed(1));
  form.value.mapY = Number(y.toFixed(1));

  const latitude = 36.2 - y * 0.006;
  const longitude = 128.25 + x * 0.006;

  form.value.latitude = latitude.toFixed(4);
  form.value.longitude = longitude.toFixed(4);
}

async function handleBulkUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  isUploading.value = true;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const data = await requestApi(RIVER_UPLOAD_API, {
      method: "POST",
      body: formData,
      isFormData: true,
    });

    const createdCount = data?.createdCount ?? 0;
    const failedCount = data?.failedCount ?? 0;

    alert(
      `파일 업로드가 완료되었습니다.\n등록 성공: ${createdCount}개\n등록 실패: ${failedCount}개`,
    );

    await fetchRivers();
  } catch (error) {
    console.error(error);
    alert(error.message || "유역 파일 업로드에 실패했습니다.");
  } finally {
    isUploading.value = false;
    event.target.value = "";
  }
}

function validateForm() {
  if (!form.value.name.trim() || !form.value.address.trim()) {
    alert("유역명과 지역 정보를 입력해주세요.");
    return false;
  }

  if (form.value.latitude === "" || form.value.longitude === "") {
    alert("위도와 경도를 입력하거나 지도에서 위치를 선택해주세요.");
    return false;
  }

  if (Number.isNaN(Number(form.value.latitude))) {
    alert("위도는 숫자로 입력해주세요.");
    return false;
  }

  if (Number.isNaN(Number(form.value.longitude))) {
    alert("경도는 숫자로 입력해주세요.");
    return false;
  }

  if (
    form.value.cautionThreshold === "" ||
    form.value.dangerThreshold === "" ||
    Number.isNaN(Number(form.value.cautionThreshold)) ||
    Number.isNaN(Number(form.value.dangerThreshold))
  ) {
    alert("주의 기준과 위험 기준을 숫자로 입력해주세요.");
    return false;
  }

  if (
    Number(form.value.cautionThreshold) > Number(form.value.dangerThreshold)
  ) {
    alert("주의 기준은 위험 기준보다 작거나 같아야 합니다.");
    return false;
  }

  return true;
}

async function requestApi(url, options = {}) {
  const { isFormData = false, ...fetchOptions } = options;

  const headers = isFormData
    ? {}
    : {
        "Content-Type": "application/json",
      };

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...(fetchOptions.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;

  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error("API ERROR", {
      url,
      status: response.status,
      data,
    });

    let message = `API 요청에 실패했습니다. status: ${response.status}`;

    if (typeof data === "string" && data.trim()) {
      message = data;
    }

    if (data && typeof data === "object") {
      message =
        data.message ||
        data.detail ||
        data.error ||
        Object.entries(data)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            }

            if (value && typeof value === "object") {
              return `${key}: ${JSON.stringify(value)}`;
            }

            return `${key}: ${value}`;
          })
          .join("\n") ||
        message;
    }

    throw new Error(message);
  }

  return data;
}

function normalizeRiverList(items) {
  return items.map((item) => normalizeRiver(item));
}

function normalizeRiver(item) {
  const latitude = item?.latitude ?? "";
  const longitude = item?.longitude ?? "";

  return {
    id: item?.id,
    name: item?.name ?? "",
    address: item?.address ?? "",
    latitude,
    longitude,
    risk: item?.risk ?? "보통",
    lastAnalyzedAt: item?.lastAnalyzedAt ?? "",
    cautionThreshold: item?.cautionThreshold ?? RISK_STANDARD.caution,
    dangerThreshold: item?.dangerThreshold ?? RISK_STANDARD.danger,
    createdAt: item?.createdAt ?? "",
    analysisCount: item?.analysisCount ?? 0,
    totalSkygazerCount: item?.totalSkygazerCount ?? 0,
    latestSkygazerCount: item?.latestSkygazerCount ?? 0,
    mapX: convertLongitudeToMapX(longitude),
    mapY: convertLatitudeToMapY(latitude),
  };
}

function convertLongitudeToMapX(longitude) {
  const value = Number(longitude);
  if (Number.isNaN(value)) return 50;

  const minLng = 128.2;
  const maxLng = 128.8;
  const x = ((value - minLng) / (maxLng - minLng)) * 100;

  return clamp(Number(x.toFixed(1)), 8, 92);
}

function convertLatitudeToMapY(latitude) {
  const value = Number(latitude);
  if (Number.isNaN(value)) return 50;

  const minLat = 35.6;
  const maxLat = 36.1;
  const y = 100 - ((value - minLat) / (maxLat - minLat)) * 100;

  return clamp(Number(y.toFixed(1)), 8, 92);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCoordinate(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return "-";
  }

  return numberValue.toFixed(4);
}

function getRiskBadge(risk) {
  if (risk === "위험") return "bg-red-100 text-red-500 border border-red-100";

  if (risk === "주의") {
    return "bg-amber-50 text-amber-600 border border-amber-100";
  }

  return "bg-emerald-50 text-emerald-600 border border-emerald-100";
}

function getRiskTextColor(risk) {
  if (risk === "위험") return "text-red-500";
  if (risk === "주의") return "text-amber-600";
  return "text-emerald-600";
}

function getMarkerColor(risk) {
  if (risk === "위험") return "bg-red-400";
  if (risk === "주의") return "bg-yellow-400";
  return "bg-green-400";
}
</script>
