<template>
  <main class="flex-1 px-9 py-8 max-w-6xl w-full mx-auto">

      <!-- 헤더 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#1a1a2e]">통계 분석</h1>
      </div>

      <!-- 조회 기간 필터 -->
      <div class="bg-white rounded-xl px-5 py-4 border border-gray-200 flex items-center gap-3 mb-6">
        <span class="text-sm font-semibold text-gray-600">조회 기간</span>
        <input v-model="startDate" type="date" class="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#2c3e6b]" />
        <span class="text-gray-400">~</span>
        <input v-model="endDate" type="date" class="border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#2c3e6b]" />
        <div class="ml-auto flex gap-2">
          <button @click="resetDate" class="px-4 py-1.5 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 cursor-pointer transition">초기화</button>
          <button @click="applyFilter" class="px-4 py-1.5 text-sm bg-[#2c3e6b] text-white rounded-md hover:bg-[#1e2d52] cursor-pointer transition">조회</button>
        </div>
      </div>

      <!-- 요약 카드 4개 -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-[#2c3e6b] text-white rounded-xl p-5">
          <p class="text-xs text-blue-200 mb-2">총 탐지 개체 수</p>
          <p class="text-3xl font-bold">1,247<span class="text-lg font-normal ml-1">마리</span></p>
          <span class="inline-block mt-2 px-2 py-0.5 bg-blue-400/30 text-blue-100 text-xs rounded-md">▲ 전년 대비 +18%</span>
        </div>
        <div class="bg-white rounded-xl p-5 border border-gray-200">
          <p class="text-xs text-gray-400 mb-2">분석 영상 수</p>
          <p class="text-3xl font-bold text-gray-800">48<span class="text-lg font-normal ml-1">건</span></p>
          <span class="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-400 text-xs rounded-md">▲ 이번 달 +3</span>
        </div>
        <div class="bg-white rounded-xl p-5 border border-gray-200">
          <p class="text-xs text-gray-400 mb-2">최다 발견 지역</p>
          <p class="text-2xl font-bold text-gray-800">낙동강 A-12</p>
          <span class="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-500 text-xs rounded-md">총 312마리 탐지</span>
        </div>
        <div class="bg-white rounded-xl p-5 border border-gray-200">
          <p class="text-xs text-gray-400 mb-2">최다 발견 날씨</p>
          <p class="text-2xl font-bold text-gray-800">흐림</p>
          <span class="inline-block mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-md">전체의 38%</span>
        </div>
      </div>

      <!-- 월별 강준치 발견 추이 -->
      <div class="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-gray-800">월별 강준치 발견 추이</h2>
          <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">최근 12개월</span>
        </div>
        <Line :data="monthlyChartData" :options="lineOptions" />
      </div>

      <!-- 지역별 + 날씨별 -->
      <div class="grid grid-cols-2 gap-6 mb-8">

        <!-- 지역별 발견 현황 -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h2 class="text-base font-bold text-gray-800 mb-4">지역별 발견 현황</h2>
          <Bar :data="regionalChartData" :options="horizontalBarOptions" />
        </div>

        <!-- 날씨별 개체 수 -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h2 class="text-base font-bold text-gray-800 mb-4">날씨별 개체 수</h2>
          <Bar :data="weatherChartData" :options="verticalBarOptions" />
        </div>

      </div>


    </main>
</template>

<script setup>
import { ref } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// 날짜 기본값: 최근 1년
const today = new Date()
const oneYearAgo = new Date()
oneYearAgo.setFullYear(today.getFullYear() - 1)
const endDate = ref(today.toISOString().split('T')[0])
const startDate = ref(oneYearAgo.toISOString().split('T')[0])

function resetDate() {
  endDate.value = today.toISOString().split('T')[0]
  startDate.value = oneYearAgo.toISOString().split('T')[0]
}

// 백엔드 연결 시 실제 필터 로직으로 교체
function applyFilter() {}


// 월별 라인 차트 데이터 (목데이터 - 백엔드 연결 시 교체)
const monthlyChartData = {
  labels: ['4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', '1월', '2월', '3월'],
  datasets: [{
    data: [65, 82, 125, 158, 200, 210, 168, 95, 42, 35, 52, 110],
    fill: true,
    backgroundColor: 'rgba(44, 62, 107, 0.08)',
    borderColor: '#2c3e6b',
    borderWidth: 2,
    tension: 0.4,
    pointBackgroundColor: '#2c3e6b',
    pointRadius: 4,
    pointHoverRadius: 6,
  }]
}

const lineOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y}마리` } }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (val) => `${val}마리`, font: { size: 11 } },
      grid: { color: '#f0f0f0' }
    },
    x: { ticks: { font: { size: 11 } }, grid: { display: false } }
  }
}

// 지역별 가로 막대 차트 (목데이터 - 백엔드 연결 시 교체)
const regionalChartData = {
  labels: ['낙동강 A-12', '금호강 K-03', '신천 S-07', '낙동강 B-01', '기타'],
  datasets: [{
    data: [312, 285, 198, 156, 296],
    backgroundColor: ['#2c3e6b', '#3b5998', '#4a7fc1', '#6aaed6', '#c0cfe8'],
    borderRadius: 6,
  }]
}

const horizontalBarOptions = {
  indexAxis: 'y',
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x}마리` } }
  },
  scales: {
    x: {
      ticks: { callback: (val) => `${val}마리`, font: { size: 11 } },
      grid: { color: '#f0f0f0' }
    },
    y: { ticks: { font: { size: 11 } }, grid: { display: false } }
  }
}

// 날씨별 세로 막대 차트 (목데이터 - 공공데이터 연동 시 교체)
const weatherChartData = {
  labels: ['맑음', '흐림', '비', '눈', '안개'],
  datasets: [{
    data: [258, 452, 312, 75, 150],
    backgroundColor: ['#f59e0b', '#9ca3af', '#3b82f6', '#93c5fd', '#d1d5db'],
    borderRadius: 8,
    barThickness: 35,  
  }]
}

const verticalBarOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y}마리` } }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (val) => `${val}마리`, font: { size: 11 } },
      grid: { color: '#f0f0f0' }
    },
    x: { ticks: { font: { size: 11 } }, grid: { display: false } }
  }
}
</script>
