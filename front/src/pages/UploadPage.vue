<template>
  <div class="min-h-[calc(100vh-120px)] bg-slate-50 px-8 py-8">
    <!-- 오른쪽 위 업로드 버튼 -->
    <div class="flex justify-end mb-6">
      <label
        for="file-upload"
        class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-900 text-white text-base font-semibold shadow-sm hover:bg-blue-800 transition cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
        </svg>
        영상 업로드
      </label>

      <input
        id="file-upload"
        type="file"
        accept="video/*"
        class="hidden"
        @change="handleFileChange" />
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <!-- 1단계: 드롭박스만 -->
      <div v-if="step === 1">
        <div
          class="border-2 border-dashed border-sky-200 rounded-[32px] bg-slate-50 h-[300px] flex flex-col items-center justify-center text-center transition hover:border-sky-300"
          @dragover.prevent
          @drop.prevent="handleDrop">
          <div
            class="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-7 h-7 text-sky-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
          </div>

          <p class="text-2xl font-extrabold text-slate-800 mb-2">
            영상을 여기에 드래그하세요.
          </p>
          <p class="text-sm text-slate-400 font-medium">
            MP4, AVI 파일 지원 (최대 2GB)
          </p>
        </div>
      </div>

      <!-- 2단계: 업로드 후 -->
      <div v-else-if="step === 2">
        <!-- 업로드된 파일 표시 -->
        <div
          class="border-2 border-dashed border-sky-200 rounded-[32px] bg-slate-50 h-[220px] flex flex-col items-center justify-center text-center transition hover:border-sky-300"
          @dragover.prevent
          @drop.prevent="handleDrop">
          <div
            class="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-sky-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
          </div>

          <p class="text-xl font-extrabold text-slate-800 mb-2 break-all px-4">
            {{ fileInfo.name }}
          </p>
          <p class="text-sm text-slate-400 font-medium">
            다른 파일로 바꾸려면 다시 업로드하거나 드래그하세요.
          </p>
        </div>

        <!-- 유역 선택 / 촬영일 선택 -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              분석 전 강 유역 선택
            </label>
            <select
              v-model="selectedRiver"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
              <option disabled value="">유역을 선택해주세요</option>
              <option
                v-for="river in riverOptions"
                :key="river.id"
                :value="river.id">
                {{ river.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              촬영일 선택
            </label>

            <div class="grid grid-cols-3 gap-2">
              <select
                v-model="selectedYear"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
                <option disabled value="">년</option>
                <option v-for="year in yearOptions" :key="year" :value="year">
                  {{ year }}년
                </option>
              </select>

              <select
                v-model="selectedMonth"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
                <option disabled value="">월</option>
                <option
                  v-for="month in monthOptions"
                  :key="month"
                  :value="month">
                  {{ month }}월
                </option>
              </select>

              <select
                v-model="selectedDay"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
                <option disabled value="">일</option>
                <option v-for="day in dayOptions" :key="day" :value="day">
                  {{ day }}일
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 영상 정보 미리보기 -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-slate-900">영상 정보 미리보기</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p class="text-xs text-slate-400 mb-1">파일명</p>
              <p class="text-sm font-semibold text-slate-800 break-all">
                {{ fileInfo.name }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p class="text-xs text-slate-400 mb-1">파일 크기</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ fileInfo.size }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p class="text-xs text-slate-400 mb-1">파일 형식</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ fileInfo.type }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p class="text-xs text-slate-400 mb-1">영상 길이</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ fileInfo.duration || "-" }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p class="text-xs text-slate-400 mb-1">촬영일</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ selectedDate || "-" }}
              </p>
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="mt-8 flex justify-end">
          <button
            class="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedRiver || !selectedDate"
            @click="startAnalysis">
            분석 시작
          </button>
        </div>
      </div>

      <!-- 3단계: 분석 요청 후 -->
      <div v-else-if="step === 3" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- 왼쪽 큰 상태 카드 -->
        <div
          class="xl:col-span-2 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-xs font-bold tracking-[0.2em] text-sky-500 uppercase mb-2">
                Video Analysis
              </p>
              <h3 class="text-3xl font-bold text-slate-900">
                {{ analysisTitle }}
              </h3>
            </div>

            <div
              class="px-4 py-2 rounded-full text-sm font-semibold"
              :class="analysisBadgeClass">
              {{ analysisBadgeText }}
            </div>
          </div>

          <!-- 임시 진행 게이지 -->
          <div class="mt-7">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-semibold text-slate-700">
                {{ progressLabel }}
              </p>
              <p class="text-sm font-bold text-sky-600">{{ progress }}%</p>
            </div>

            <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="progressBarClass"
                :style="{ width: `${progress}%` }"></div>
            </div>
          </div>

          <!-- 상태 메시지 -->
          <div
            class="mt-8 rounded-2xl border p-5"
            :class="analysisMessageBoxClass">
            <p
              class="text-base font-semibold"
              :class="analysisMessageTextClass">
              {{ analysisMessage }}
            </p>

            <p
              v-if="analysisStatus === 'loading'"
              class="mt-2 text-sm text-slate-500">
              분석이 완료되면 결과가 표시됩니다. 잠시만 기다려주세요.
            </p>

            <p
              v-if="analysisStatus === 'success'"
              class="mt-2 text-sm text-slate-500">
              아래 버튼을 통해 새 영상을 업로드할 수 있습니다.
            </p>

            <p
              v-if="analysisStatus === 'failed'"
              class="mt-2 text-sm text-slate-500">
              네트워크 상태나 영상 파일을 확인한 뒤 다시 시도해주세요.
            </p>
          </div>

          <div class="mt-8 flex justify-end gap-3">
            <button
              v-if="analysisStatus === 'failed'"
              class="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
              @click="startAnalysis">
              다시 분석하기
            </button>

            <button
              v-if="analysisStatus === 'success' || analysisStatus === 'failed'"
              class="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition"
              @click="resetPage">
              새 영상 업로드
            </button>
          </div>
        </div>

        <!-- 오른쪽 요약 카드 -->
        <div
          class="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h4 class="text-lg font-bold text-slate-900 mb-5">분석 정보</h4>

          <div class="space-y-4">
            <div>
              <p class="text-xs text-slate-400 mb-1">파일명</p>
              <p class="text-sm font-semibold text-slate-800 break-all">
                {{ fileInfo.name }}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400 mb-1">선택 유역</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ selectedRiverInfo?.name || "-" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400 mb-1">촬영일</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ selectedDate || "-" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400 mb-1">영상 길이</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ fileInfo.duration || "-" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400 mb-1">현재 상태</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ currentStatus }}
              </p>
            </div>

            <div>
              <p class="text-xs text-slate-400 mb-1">강준치 개체 수</p>
              <p class="text-sm font-semibold text-slate-800">
                {{
                  analysisStatus === "success" ? `${skygazerCount}마리` : "-"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const step = ref(1); // 1: 드롭박스만 / 2: 정보확인 / 3: 분석 요청 후
const selectedFile = ref(null);
const selectedRiver = ref("");

const selectedYear = ref("");
const selectedMonth = ref("");
const selectedDay = ref("");

const progress = ref(0);
const analysisStatus = ref("idle"); // idle | loading | success | failed
const skygazerCount = ref(0); // 강준치 개체 수

const riverOptions = ref([
  { id: 1, name: "낙동강 A-12", address: "대구 달성군" },
  { id: 2, name: "금호강 K-03", address: "대구 북구" },
  { id: 3, name: "신천 S-07", address: "대구 수성구" },
  { id: 4, name: "낙동강 B-01", address: "대구 달서구" },
]);

const fileInfo = ref({
  name: "",
  size: "",
  type: "",
  duration: "",
  durationSeconds: 0,
});

const currentYear = new Date().getFullYear();

const yearOptions = computed(() => {
  const years = [];

  for (let year = currentYear; year >= currentYear - 10; year--) {
    years.push(year);
  }

  return years;
});

const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, index) => index + 1);
});

const dayOptions = computed(() => {
  if (!selectedYear.value || !selectedMonth.value) {
    return Array.from({ length: 31 }, (_, index) => index + 1);
  }

  const lastDay = new Date(
    selectedYear.value,
    selectedMonth.value,
    0,
  ).getDate();

  return Array.from({ length: lastDay }, (_, index) => index + 1);
});

const selectedDate = computed(() => {
  if (!selectedYear.value || !selectedMonth.value || !selectedDay.value) {
    return "";
  }

  const month = String(selectedMonth.value).padStart(2, "0");
  const day = String(selectedDay.value).padStart(2, "0");

  return `${selectedYear.value}-${month}-${day}`;
});

watch([selectedYear, selectedMonth], () => {
  if (!selectedDay.value) return;

  const lastDay = new Date(
    selectedYear.value,
    selectedMonth.value,
    0,
  ).getDate();

  if (selectedDay.value > lastDay) {
    selectedDay.value = "";
  }
});

const selectedRiverInfo = computed(() => {
  return riverOptions.value.find((river) => river.id === selectedRiver.value);
});

const analysisTitle = computed(() => {
  if (analysisStatus.value === "loading") return "영상 분석 중...";
  if (analysisStatus.value === "success") return "분석 완료";
  if (analysisStatus.value === "failed") return "분석 실패";
  return "영상 분석";
});

const analysisMessage = computed(() => {
  if (analysisStatus.value === "loading") {
    return "영상 분석 요청이 접수되어 분석이 진행되고 있습니다.";
  }

  if (analysisStatus.value === "success") {
    return "영상 분석이 완료되었습니다.";
  }

  if (analysisStatus.value === "failed") {
    return "영상 분석 중 문제가 발생했습니다.";
  }

  return "";
});

const analysisBadgeText = computed(() => {
  if (analysisStatus.value === "loading") return "분석 중";
  if (analysisStatus.value === "success") return "완료";
  if (analysisStatus.value === "failed") return "실패";
  return "대기";
});

const analysisBadgeClass = computed(() => {
  if (analysisStatus.value === "loading") {
    return "bg-sky-100 text-sky-700";
  }

  if (analysisStatus.value === "success") {
    return "bg-sky-100 text-sky-700";
  }

  if (analysisStatus.value === "failed") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-500";
});

const progressLabel = computed(() => {
  if (analysisStatus.value === "loading") return "분석 요청 처리 중";
  if (analysisStatus.value === "success") return "분석 완료";
  if (analysisStatus.value === "failed") return "분석 실패";
  return "대기 중";
});

const progressBarClass = computed(() => {
  if (analysisStatus.value === "failed") return "bg-red-500";
  return "bg-sky-500";
});

const analysisMessageBoxClass = computed(() => {
  if (analysisStatus.value === "failed") {
    return "bg-red-50 border-red-100";
  }

  if (analysisStatus.value === "success") {
    return "bg-sky-50 border-sky-100";
  }

  return "bg-slate-50 border-slate-200";
});

const analysisMessageTextClass = computed(() => {
  if (analysisStatus.value === "failed") return "text-red-700";
  if (analysisStatus.value === "success") return "text-sky-700";
  return "text-slate-800";
});

const currentStatus = computed(() => {
  if (analysisStatus.value === "loading") return "분석 중";
  if (analysisStatus.value === "success") return "분석 완료";
  if (analysisStatus.value === "failed") return "분석 실패";
  return "-";
});

const formatFileSize = (bytes) => {
  if (!bytes) return "-";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "-";

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  if (hours > 0) {
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
};

const getVideoDuration = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const durationSeconds = Math.floor(video.duration);
      const duration = formatDuration(durationSeconds);

      URL.revokeObjectURL(objectUrl);

      resolve({
        duration,
        durationSeconds,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      resolve({
        duration: "-",
        durationSeconds: 0,
      });
    };
  });
};

const resetSelectedDate = () => {
  selectedYear.value = "";
  selectedMonth.value = "";
  selectedDay.value = "";
};

const updateFileInfo = async (file) => {
  if (!file) return;

  selectedFile.value = file;

  const { duration, durationSeconds } = await getVideoDuration(file);

  fileInfo.value = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || "video/*",
    duration,
    durationSeconds,
  };

  selectedRiver.value = "";
  resetSelectedDate();
  progress.value = 0;
  analysisStatus.value = "idle";
  skygazerCount.value = 0;
  step.value = 2;
};

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (file) await updateFileInfo(file);

  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
  event.target.value = "";
};

const handleDrop = async (event) => {
  const file = event.dataTransfer.files?.[0];
  if (file) await updateFileInfo(file);
};

const startFakeProgress = () => {
  progress.value = 0;

  return setInterval(() => {
    if (progress.value < 90) {
      progress.value += 5;
    }
  }, 500);
};

const startAnalysis = async () => {
  if (!selectedFile.value || !selectedRiver.value || !selectedDate.value) {
    return;
  }

  // API 명세서 기준:
  // {
  //   file: "File",
  //   riverId: 1,
  //   date: "2026-03-15",
  //   duration: 192
  // }

  const formData = new FormData();
  formData.append("file", selectedFile.value);
  formData.append("riverId", selectedRiver.value);
  formData.append("date", selectedDate.value);
  formData.append("duration", fileInfo.value.durationSeconds);

  console.log("영상 분석 요청 FormData");
  console.log("file:", selectedFile.value);
  console.log("riverId:", selectedRiver.value);
  console.log("date:", selectedDate.value);
  console.log("duration:", fileInfo.value.durationSeconds);

  step.value = 3;
  analysisStatus.value = "loading";
  progress.value = 0;
  skygazerCount.value = 0;

  const timer = startFakeProgress();

  try {
    // TODO: 백엔드 연결 시 아래 부분 교체
    // const response = await axios.post("/videos", formData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });

    // TODO: 임시 테스트용 코드
    await new Promise((resolve) => setTimeout(resolve, 3000));

    clearInterval(timer);

    progress.value = 100;
    analysisStatus.value = "success";

    // TODO: 추후 백엔드 API 응답값으로 교체
    // 예: skygazerCount.value = response.data.skygazerCount;
    skygazerCount.value = 12;
  } catch (error) {
    clearInterval(timer);

    progress.value = 100;
    analysisStatus.value = "failed";

    console.error("영상 분석 요청 실패:", error);
  }
};

const resetPage = () => {
  step.value = 1;
  selectedFile.value = null;
  selectedRiver.value = "";
  resetSelectedDate();
  progress.value = 0;
  analysisStatus.value = "idle";
  skygazerCount.value = 0;

  fileInfo.value = {
    name: "",
    size: "",
    type: "",
    duration: "",
    durationSeconds: 0,
  };
};
</script>
