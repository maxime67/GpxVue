<script setup>
import { ref, onMounted, watchEffect } from 'vue';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import axios from 'axios';
import 'ol/ol.css'; // Add this import

const mapRef = ref(null);
const trackData = ref(null);
const loading = ref(true);
const error = ref(null);
let map = null;

const fetchTrackData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get(import.meta.env.VITE_APIURL);
    trackData.value = response.data;
  } catch (err) {
    error.value = `Error loading track data: ${err.message}`;
    console.error('Error fetching track data:', err);
  } finally {
    loading.value = false;
  }
};

const createTrackFeature = (points) => {
  const coordinates = points.map(point =>
      fromLonLat([point.longitude, point.latitude])
  );

  return new Feature({
    geometry: new LineString(coordinates)
  });
};

const createStartEndPoints = (points) => {
  if (!points.length) return [];

  const startPoint = new Feature({
    geometry: new Point(fromLonLat([
      points[0].longitude,
      points[0].latitude
    ]))
  });

  const endPoint = new Feature({
    geometry: new Point(fromLonLat([
      points[points.length - 1].longitude,
      points[points.length - 1].latitude
    ]))
  });

  startPoint.setStyle(new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: 'green' }),
      stroke: new Stroke({ color: 'white', width: 2 })
    })
  }));

  endPoint.setStyle(new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({ color: 'red' }),
      stroke: new Stroke({ color: 'white', width: 2 })
    })
  }));

  return [startPoint, endPoint];
};

const initializeMap = async (track) => {
  if (!track.track.points.length) return;

  if (map) {
    map.setTarget(null); // Clean up existing map
  }

  const vectorSource = new VectorSource();

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'red',
        width: 3
      })
    })
  });

  map = new Map({
    target: 'map',  // This should match the id of your map container
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

  const trackFeature = createTrackFeature(track.track.points);
  const pointFeatures = createStartEndPoints(track.track.points);

  vectorSource.addFeature(trackFeature);
  pointFeatures.forEach(feature => vectorSource.addFeature(feature));
};

onMounted(async () => {
  await fetchTrackData();
});
</script>

<template>
  <div class="flex">
    <aside v-if="trackData" class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
      <div class="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <ul class="space-y-2 font-medium">
          <li v-for="track in trackData" :key="track.track.name">
            <button @click="initializeMap(track)" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              <span class="ms-3">{{ track.track.name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <div id="map" class="ml-64 w-full" style="width: 1000px; height: 600px"></div>
  </div>

</template>
