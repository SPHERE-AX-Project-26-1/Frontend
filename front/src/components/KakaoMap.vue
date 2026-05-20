<template>
  <div class="relative h-full w-full">
    <div
      ref="mapContainer"
      class="h-full min-h-[610px] w-full rounded-[32px]"></div>

    <div
      v-if="!isMapLoaded"
      class="absolute inset-0 flex items-center justify-center rounded-[32px] bg-[#DFF0FA] text-sm font-bold text-[#08243D]">
      지도를 불러오는 중입니다...
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  rivers: {
    type: Array,
    default: () => [],
  },
  selectedRiver: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["select-river"]);

const mapContainer = ref(null);
const map = ref(null);
const markers = ref([]);
const isMapLoaded = ref(false);

onMounted(() => {
  createMap();
});

watch(
  () => props.rivers,
  () => {
    if (map.value) {
      drawMarkers();
    }
  },
  { deep: true },
);

watch(
  () => props.selectedRiver,
  () => {
    if (map.value) {
      drawMarkers();
    }
  },
  { deep: true },
);

function createMap() {
  if (!mapContainer.value) return;

  if (!window.kakao || !window.kakao.maps) {
    console.error("카카오맵 SDK가 아직 로드되지 않았습니다.");
    return;
  }

  window.kakao.maps.load(() => {
    const center = new window.kakao.maps.LatLng(35.91, 128.584);

    const options = {
      center,
      level: 8,
    };

    map.value = new window.kakao.maps.Map(mapContainer.value, options);
    isMapLoaded.value = true;

    drawMarkers();
  });
}

function drawMarkers() {
  clearMarkers();

  props.rivers.forEach((river) => {
    if (!river.latitude || !river.longitude) return;

    const markerPosition = new window.kakao.maps.LatLng(
      river.latitude,
      river.longitude,
    );

    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: map.value,
      image: createMarkerImage(river),
      zIndex: isSelectedRiver(river) ? 20 : 10,
    });

    window.kakao.maps.event.addListener(marker, "click", () => {
      emit("select-river", river);
      map.value.panTo(markerPosition);
    });

    markers.value.push(marker);
  });
}

function clearMarkers() {
  markers.value.forEach((marker) => {
    marker.setMap(null);
  });

  markers.value = [];
}

function createMarkerImage(river) {
  const markerColor = getMarkerColor(river.risk);
  const selected = isSelectedRiver(river);

  const width = selected ? 42 : 36;
  const height = selected ? 50 : 44;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 43C18 43 34 27.5 34 16.8C34 7.9 26.8 1 18 1C9.2 1 2 7.9 2 16.8C2 27.5 18 43 18 43Z"
        fill="${markerColor}"
        stroke="white"
        stroke-width="${selected ? 3.5 : 3}"
      />
      <circle
        cx="18"
        cy="17"
        r="6.5"
        fill="white"
        opacity="0.95"
      />
      <circle
        cx="18"
        cy="17"
        r="3.2"
        fill="${markerColor}"
      />
    </svg>
  `;

  const markerSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  const markerSize = new window.kakao.maps.Size(width, height);

  const markerOption = {
    offset: new window.kakao.maps.Point(width / 2, height),
  };

  return new window.kakao.maps.MarkerImage(markerSrc, markerSize, markerOption);
}

function isSelectedRiver(river) {
  return props.selectedRiver?.id === river.id;
}

function getMarkerColor(risk) {
  if (risk === "위험") return "#EF4444";
  if (risk === "주의") return "#FACC15";
  return "#22C55E";
}
</script>
