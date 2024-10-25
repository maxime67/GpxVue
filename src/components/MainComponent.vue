<script setup>
import {ref, onMounted, watchEffect, onBeforeUnmount} from 'vue';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import {Feature} from 'ol';
import {Point} from 'ol/geom';
import {fromLonLat} from 'ol/proj';
import {Style, Stroke, Circle, Fill} from 'ol/style';
import 'ol/ol.css';
import * as compute from "../utils/ComputeMethods.vue"
import * as mapp from "../utils/MapMethods.vue"
import * as api from "../utils/ApiMethods.vue"

const mapRef = ref(null);
let map = ref(null);
const trackData = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedTrack = ref(null);


const initializeMap = async (track) => {
  if (!track.track.points.length) return;
  selectedTrack.value = track;
  setTimeout(() => {
    if (map.value) {
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
    // Clear the map container
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.innerHTML = '';
    }
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

    const trackFeature = mapp.createTrackFeature(track.track.points);
    const pointFeatures = mapp.createStartEndPoints(track.track.points);

    vectorSource.addFeature(trackFeature);
    pointFeatures.forEach(feature => vectorSource.addFeature(feature));

    // Force map to update its size
    map.updateSize();
  }, 100)
};

onMounted(async () => {
  await api.fetchTrackData(error, loading, trackData);
});
onBeforeUnmount(() => {
  if (map) {
    map.setTarget(null);
    map = null;
  }
});
</script>


<template>
  <div class="bg-gray-100 flex flex-row">
    <aside
        v-if="trackData"
        class="top-0 left-0 w-72 h-screen duration-300 ease-in-out bg-white shadow-lg">
      <div class="h-full flex flex-col">
        <div class="px-6 py-4 bg-indigo-600">
          <h2 class="text-xl font-semibold text-white">Track List</h2>
        </div>
        <div class="flex-1 px-3 py-4 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="track in trackData" :key="track.track.name">
              <button
                  @click="initializeMap(track)"
                  style="rgba(245, 40, 145, 0.8)"
                  class="w-full px-4 py-3 flex flex-col rounded-lg transition-all duration-200
                       hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500
                       group relative overflow-hidden"
              >
                <span class="text-gray-800 font-medium group-hover:text-indigo-600">
                  {{ track.track.name }}
                </span>
                <span class="text-sm text-gray-500 mt-1">
                  Temps: {{ compute.renderTimeDuration(compute.getTimeDuration(track)) }}
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
    <div class="flex-1 p-6">
      <div v-if="selectedTrack" class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ selectedTrack.track.name }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Duration</div>
            <div class="text-xl font-semibold text-gray-800">
              {{ compute.renderTimeDuration(compute.getTimeDuration(selectedTrack)) }}
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Average Speed</div>
            <div class="text-xl font-semibold text-gray-800">
              {{
                compute.calculateAverageSpeed(compute.computeAllDistance(selectedTrack.track.points) / 1000, compute.getTimeDurationInHours(selectedTrack))
              }} km/h
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Distance</div>
            <div class="text-xl font-semibold text-gray-800">
              {{ compute.computeAllDistance(selectedTrack.track.points) / 1000 }} km
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Max Speed</div>
            <div class="text-xl font-semibold text-gray-800">
              <!--              {{ computeAllDistance(selectedTrack.track.points) }} km/h-->
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-4">
            <div class="text-sm text-gray-500 mb-1">Elevation Gain</div>
            <div class="text-xl font-semibold text-gray-800">
              {{ compute.calculateElevationGain(selectedTrack.track.points) }}m
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

/* Ensure the OpenLayers map container takes full size */
.ol-viewport {
  width: 100% !important;
  height: 100% !important;
}
</style>