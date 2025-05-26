<script setup lang="ts">
import L from "leaflet";
import { onMounted, useTemplateRef } from "vue";

const mapContainer = useTemplateRef("map-container");

function createMap() {
  if (!mapContainer.value) {
    console.error("Map container is not defined");
    return;
  }

  const map = L.map(mapContainer.value, {
    center: [51.505, -0.09],
    zoom: 13,
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

onMounted(() => {
  createMap();
});
</script>

<template><div ref="map-container" class="map-container"></div></template>

<style scoped>
.map-container {
  height: 360px;
  width: 360px;
}
</style>
