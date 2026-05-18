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
</script>
