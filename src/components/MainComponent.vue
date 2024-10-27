<script setup>
import {ref, onMounted} from 'vue';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import {Style, Stroke, Circle, Fill} from 'ol/style';
import 'ol/ol.css';
import * as computeService from "../utils/ComputeMethods.vue"
import * as mapService from "../utils/MapMethods.vue"
import * as apiService from "../utils/ApiMethods.vue"

let map = ref(null);
const trackData = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedTrack = ref(null);
const isMenuOpen = ref(false); // New state for mobile menu

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
const initializeMap = async (track) => {
  if (!track.track.points.length) return;
  setTimeout(() => {
    //Clear the map container
    selectedTrack.value = track;
    if(map.value){
      mapService.clearMap(map)
        // Remove all layers
        map.value.getLayers().clear();
        // Remove all interactions
        map.value.getInteractions().clear();
        // Remove all controls
        map.value.getControls().clear();
        // Set target to null
        map.value.setTarget(null);
        map.value = null;
      }
      const mapElement = document.getElementById('map');
      mapElement.innerHTML = '';
    const vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: '#0066cc',
          width: 3
        })
      })
    });

    map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([
          track.track.points[0].longitude,
          track.track.points[0].latitude
        ]),
        zoom: 14
      })
    });

    const trackFeature = mapService.createTrackFeature(track.track.points);
    const pointFeatures = mapService.createStartEndPoints(track.track.points);

    vectorSource.addFeature(trackFeature);
    pointFeatures.forEach(feature => vectorSource.addFeature(feature));

    // Force map to update its size
    map.updateSize();
  }, 100)
};

onMounted(async () => {
  console.log(import.meta.env.VITE_APIURL + "/gpx")
  await apiService.fetchData(error, loading, trackData, "/gpx");
});

</script>

<template>
  <div class="bg-gray-100 flex flex-col md:flex-row min-h-screen relative">
    <!-- Mobile Menu Button -->
    <button
        @click="toggleMenu"
        class="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white"
    >
      <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
      >
        <path
            v-if="!isMenuOpen"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
        />
        <path
            v-else
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Sidebar Navigation -->
    <aside
        v-if="trackData"
        :class="{
        'translate-x-0': isMenuOpen,
        '-translate-x-full': !isMenuOpen,
        'fixed': true,
        'md:relative': true,
        'md:translate-x-0': true,
        'z-40': true,
        'transition-transform': true,
        'duration-300': true,
        'ease-in-out': true,
        'bg-white': true,
        'shadow-lg': true,
        'h-screen': true,
        'w-72': true,
      }"
    >
      <div class="h-full flex flex-col">
        <div class="px-6 py-4 bg-indigo-600">
          <h2 class="text-xl font-semibold text-white">Track List</h2>
        </div>
        <div class="flex-1 px-3 py-4 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="track in trackData" :key="track.track.name">
              <button
                  @click="initializeMap(track)"
                  class="w-full px-4 py-3 flex flex-col rounded-lg transition-all duration-200
                     hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500
                     group relative overflow-hidden"
              >
                <span class="text-gray-800 font-medium group-hover:text-indigo-600">
                  {{ track.track.name }}
                </span>
                <span class="text-sm text-gray-500 mt-1">
                  Temps: {{ computeService.renderTimeDuration(computeService.getTimeDuration(track)) }}
                </span>
                <div class="absolute inset-0 border-2 border-indigo-600 opacity-0
                          group-hover:opacity-10 rounded-lg transition-opacity duration-200">
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
        v-if="isMenuOpen"
        @click="toggleMenu"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 p-6 md:p-6 pt-20 md:pt-6">
      <div v-if="selectedTrack" class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ selectedTrack.track.name }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Duration</div>
            <div class="text-xl font-semibold text-gray-800">
              {{ computeService.renderTimeDuration(computeService.getTimeDuration(selectedTrack)) }}
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Average Speed</div>
            <div class="text-xl font-semibold text-gray-800">
              {{
                computeService.calculateAverageSpeed(computeService.computeAllDistance(selectedTrack.track.points) / 1000, computeService.getTimeDurationInHours(selectedTrack))
              }} km/h
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Distance</div>
            <div class="text-xl font-semibold text-gray-800">
              {{ computeService.computeAllDistance(selectedTrack.track.points) / 1000 }} km
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Elevation Gain</div>
            <div class="text-xl font-semibold text-gray-800">
              {{ computeService.calculateElevationGain(selectedTrack.track.points) }}m
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-lg h-96">
        <div id="map" class="rounded-xl">
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#map {
  width: 100% !important;
  height: 100%;
}

.ol-viewport {
  width: 100% !important;
  height: 100% !important;
}
</style>