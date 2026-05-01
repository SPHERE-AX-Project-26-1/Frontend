<template>
  <div class="min-h-[calc(100vh-120px)] bg-slate-50">
    <!-- 오른쪽 위 업로드 버튼 -->
    <div class="flex justify-end mb-6">
      <label
        for="file-upload"
        class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-900 text-white text-sm font-semibold shadow-sm hover:bg-blue-800 transition cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
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

        <!-- 유역 선택 / 상태 -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              분석 전 강 유역 선택
            </label>
            <select
              v-model="selectedRiver"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200">
              <option disabled value="">유역을 선택해주세요</option>
              <option>낙동강</option>
              <option>금호강</option>
              <option>한강</option>
              <option>영산강</option>
              <option>섬진강</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">
              분석 예상 시간
            </label>
            <div
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              11분
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
              <p class="text-xs text-slate-400 mb-1">선택 유역</p>
              <p class="text-sm font-semibold text-slate-800">
                {{ selectedRiver || "-" }}
              </p>
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="mt-8 flex justify-end">
          <button
            class="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedRiver"
            @click="startAnalysis">
            분석 시작
          </button>
        </div>
      </div>

      <!-- 3단계: 분석 진행중 (이 부분은 임시 + 논의 후 수정 예정입니다!) -->
      <div v-else-if="step === 3" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- 왼쪽 큰 진행 카드 -->
        <div
          class="xl:col-span-2 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-xs font-bold tracking-[0.2em] text-sky-500 uppercase mb-2"></p>
              <h3 class="text-3xl font-bold text-slate-900">
                {{ currentStatusTitle }}
              </h3>
            </div>

            <div class="text-right">
              <p class="text-xs text-slate-400 mb-1">진행률</p>
              <p class="text-3xl font-extrabold text-sky-600">
                {{ progress }}%
              </p>
            </div>
          </div>

          <div
            class="mt-6 w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              class="h-full rounded-full bg-sky-500 transition-all duration-500"
              :style="{ width: `${progress}%` }"></div>
          </div>

          <div class="mt-8 space-y-4">
            <div class="flex items-center gap-4">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                :class="
                  progress >= 20
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                ">
                1
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">업로드 완료</p>
                <p class="text-xs text-slate-400">
                  영상 파일 업로드가 정상적으로 완료되었습니다.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                :class="
                  progress >= 60
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                ">
                2
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">영상 전처리</p>
                <p class="text-xs text-slate-400">
                  프레임 분리 및 분석 가능한 형태로 변환이 완료되었습니다.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                :class="
                  progress >= 100
                    ? 'bg-sky-500 text-white'
                    : 'bg-blue-100 text-blue-600'
                ">
                3
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">
                  {{ progress >= 100 ? "영상 분석 완료" : "AI 분석 진행 중" }}
                </p>
                <p class="text-xs text-slate-400">
                  어종 탐지 및 개체 수 분석이 완료되었습니다.
                </p>
              </div>
            </div>
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
                {{ selectedRiver }}
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
          </div>

          <div class="mt-8">
            <button
              v-if="progress >= 100"
              class="w-full px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition"
              @click="resetPage">
              새 영상 업로드
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const step = ref(1); // 1: 드롭박스만 / 2: 정보확인 / 3: 분석중
const selectedRiver = ref("");
const progress = ref(0);

const fileInfo = ref({
  name: "",
  size: "",
  type: "",
  duration: "",
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
      const duration = formatDuration(video.duration);
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("-");
    };
  });
};

const updateFileInfo = async (file) => {
  if (!file) return;

  const duration = await getVideoDuration(file);

  fileInfo.value = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || "video/*",
    duration,
  };

  selectedRiver.value = "";
  progress.value = 0;
  step.value = 2;
};

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (file) await updateFileInfo(file);
};

const handleDrop = async (event) => {
  const file = event.dataTransfer.files?.[0];
  if (file) await updateFileInfo(file);
};

const currentStatusTitle = computed(() => {
  if (progress.value < 30) return "업로드 진행 중...";
  if (progress.value < 60) return "영상 전처리 중...";
  if (progress.value < 100) return "분석 중...";
  return "분석 완료";
});

const stepClass = (targetStep) => {
  if (targetStep === 3 && progress.value >= 100) return "text-sky-300";
  if (targetStep === 1 && progress.value >= 20) return "text-sky-300";
  if (targetStep === 2 && progress.value >= 60) return "text-sky-300";
  if (targetStep === 3 && progress.value >= 60) return "text-white";
  return "text-slate-400";
};

const startAnalysis = () => {
  if (!selectedRiver.value) return;

  step.value = 3;
  progress.value = 0;

  const timer = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(timer);
      return;
    }
    progress.value += 5;
  }, 300);
};

const resetPage = () => {
  step.value = 1;
  selectedRiver.value = "";
  progress.value = 0;
  fileInfo.value = {
    name: "",
    size: "",
    type: "",
    duration: "",
  };
};
</script>
