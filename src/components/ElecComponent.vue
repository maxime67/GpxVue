<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import {Feature, Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import {Style, Stroke, Circle, Fill} from 'ol/style';
import 'ol/ol.css';
import * as api from "../utils/ApiMethods.vue"
import * as Geom from "ol/geom.js";
import {fromLonLat} from "ol/proj.js";
import * as computeService from "@/utils/ComputeMethods.vue";

let map = ref(null);
const data = ref(Array());
const loading = ref(true);
const error = ref(null);
const points = ref(null);
const isMenuOpen = ref(false); // New state for mobile menu

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const initializeMap = async (data) => {
  const points = await data.value;
  const vectorSource = new VectorSource();

// Create vector layer with styling
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: '#0066cc'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    })
  });

// Add features to vector source
  points.forEach(point => {
    if (point.geometry?.coordinates && Array.isArray(point.geometry.coordinates) && point.geometry.coordinates.length === 2) {
      const transformedCoords = fromLonLat(point.geometry.coordinates);
      const feature = new Feature({
        geometry: new Geom.Point(transformedCoords)
      });
      vectorSource.addFeature(feature);
    } else {
      console.warn('Invalid coordinate format:', point);
    }
  });

  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vectorLayer  // Add the vector layer here
    ],
    view: new View({
      center: fromLonLat([0, 0]),
      zoom: 2
    })
  });

// Fit view to show all features if there are any
  if (vectorSource.getFeatures().length > 0) {
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      maxZoom: 16
    });
  }

  map.updateSize();
};

onMounted(async () => {
  await api.fetchData(error, loading, data, "/elec");
  await initializeMap(data);
});

onBeforeUnmount(() => {
  if (map) {
    map.setTarget(null);
    map = null;
  }
});
</script>
<template>
  <div class="bg-gray-100 flex flex-col md:flex-row min-h-screen relative">
    <!-- Overlay for mobile -->
    <div
        v-if="isMenuOpen"
        @click="toggleMenu"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
    ></div>
    <aside
        v-if="data"
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
    <!-- Main Content -->
    <div class="flex-1 p-6 md:p-6 pt-20 md:pt-6">
      <div v-if="data" class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4"></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Duration</div>
            <div class="text-xl font-semibold text-gray-800">
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Average Speed</div>
            <div class="text-xl font-semibold text-gray-800">

            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Distance</div>
            <div class="text-xl font-semibold text-gray-800">
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Elevation Gain</div>
            <div class="text-xl font-semibold text-gray-800">
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
<!--  <div class="bg-gray-100 flex flex-col md:flex-row min-h-screen relative">-->
<!--    &lt;!&ndash; Mobile Menu Button &ndash;&gt;-->
<!--    <button-->
<!--        @click="toggleMenu"-->
<!--        class="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white"-->
<!--    >-->
<!--      <svg-->
<!--          xmlns="http://www.w3.org/2000/svg"-->
<!--          class="h-6 w-6"-->
<!--          fill="none"-->
<!--          viewBox="0 0 24 24"-->
<!--          stroke="currentColor"-->
<!--      >-->
<!--        <path-->
<!--            v-if="!isMenuOpen"-->
<!--            strokeLinecap="round"-->
<!--            strokeLinejoin="round"-->
<!--            strokeWidth="2"-->
<!--            d="M4 6h16M4 12h16M4 18h16"-->
<!--        />-->
<!--        <path-->
<!--            v-else-->
<!--            strokeLinecap="round"-->
<!--            strokeLinejoin="round"-->
<!--            strokeWidth="2"-->
<!--            d="M6 18L18 6M6 6l12 12"-->
<!--        />-->
<!--      </svg>-->
<!--    </button>-->

<!--    &lt;!&ndash; Sidebar Navigation &ndash;&gt;-->

<!--    &lt;!&ndash;  </div>&ndash;&gt;-->
<!--    &lt;!&ndash; Main Content &ndash;&gt;-->
<!--    <div class="bg-gray-100 flex flex-col md:flex-row min-h-screen relative">-->

<!--      <div class="flex-1 p-6 md:p-6 pt-20 md:pt-6">-->
<!--        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">-->
<!--          <div class="bg-white rounded-xl shadow-sm p-4">-->
<!--            <div class="text-sm text-gray-500 mb-1">Duration</div>-->
<!--            <div class="text-xl font-semibold text-gray-800">-->
<!--              aa-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="flex-1 p-6 md:p-6 pt-20 md:pt-6">-->
<!--          <div v-if="data" class="mb-6">-->
<!--            &lt;!&ndash;      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">&ndash;&gt;-->
<!--            <div class="bg-white rounded-xl shadow-lg h-96">-->
<!--              <div id="map" class="rounded-xl">-->
<!--              </div>-->
<!--              &lt;!&ndash;        </div>&ndash;&gt;-->
<!--            </div>-->

<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

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