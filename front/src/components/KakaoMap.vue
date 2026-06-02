<template>
  <div :class="wrapperClass">
    <div ref="mapContainer" :class="mapContainerClass"></div>

    <div v-if="!isMapLoaded" :class="loadingClass">
      지도를 불러오는 중입니다...
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  rivers: {
    type: Array,
    default: () => [],
  },
  selectedRiver: {
    type: Object,
    default: null,
  },

  enablePositionSelect: {
    type: Boolean,
    default: false,
  },

  variant: {
    type: String,
    default: "dashboard",
  },

  mapLevel: {
    type: Number,
    default: 8,
  },
});

const emit = defineEmits(["select-river", "select-position"]);

const mapContainer = ref(null);
const map = ref(null);
const markers = ref([]);
const isMapLoaded = ref(false);

const DEFAULT_CENTER = {
  latitude: 35.91,
  longitude: 128.584,
};

const wrapperClass = computed(() => {
  const roundedClass =
    props.variant === "compact" ? "rounded-2xl" : "rounded-[32px]";

  return `relative h-full w-full overflow-hidden ${roundedClass}`;
});

const mapContainerClass = computed(() => {
  if (props.variant === "compact") {
    return "h-full min-h-[210px] w-full rounded-2xl";
  }

  return "h-full min-h-[610px] w-full rounded-[32px]";
});

const loadingClass = computed(() => {
  const roundedClass =
    props.variant === "compact" ? "rounded-2xl" : "rounded-[32px]";

  return `absolute inset-0 flex items-center justify-center ${roundedClass} bg-[#DFF0FA] text-sm font-bold text-[#08243D]`;
});

onMounted(() => {
  createMap();
});

onBeforeUnmount(() => {
  clearMarkers();
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
      moveToSelectedRiver();
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
    const centerPosition = getInitialCenter();

    const center = new window.kakao.maps.LatLng(
      centerPosition.latitude,
      centerPosition.longitude,
    );

    const options = {
      center,
      level: props.mapLevel,
    };

    map.value = new window.kakao.maps.Map(mapContainer.value, options);
    isMapLoaded.value = true;

    if (props.enablePositionSelect) {
      window.kakao.maps.event.addListener(map.value, "click", (mouseEvent) => {
        const latLng = mouseEvent.latLng;

        emit("select-position", {
          latitude: latLng.getLat(),
          longitude: latLng.getLng(),
        });
      });
    }

    drawMarkers();
    moveToSelectedRiver();
  });
}

function getInitialCenter() {
  const selectedPosition = getValidPosition(props.selectedRiver);

  if (selectedPosition) {
    return selectedPosition;
  }

  const firstRiver = props.rivers.find((river) => getValidPosition(river));
  const firstPosition = getValidPosition(firstRiver);

  if (firstPosition) {
    return firstPosition;
  }

  return DEFAULT_CENTER;
}

function getValidPosition(river) {
  if (!river) return null;

  const latitude = Number(river.latitude);
  const longitude = Number(river.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function drawMarkers() {
  clearMarkers();

  props.rivers.forEach((river) => {
    const position = getValidPosition(river);
    if (!position) return;

    const markerPosition = new window.kakao.maps.LatLng(
      position.latitude,
      position.longitude,
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

function moveToSelectedRiver() {
  const position = getValidPosition(props.selectedRiver);
  if (!position || !map.value) return;

  const selectedPosition = new window.kakao.maps.LatLng(
    position.latitude,
    position.longitude,
  );

  map.value.panTo(selectedPosition);
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
