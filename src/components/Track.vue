<template>
  <div class="map-container">
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">Loading track data...</div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <template v-if="trackData">
      <div ref="mapRef" class="map-view"></div>
      <div class="track-info">
        <h3>{{ trackData.track.name }}</h3>
        <p>Type: {{ trackData.track.type }}</p>
        <p>Date: {{ formatDate(trackData.metadata.time) }}</p>
      </div>
    </template>
  </div>
  <ol-map style="min-width: 900px; min-height: 600px;">
<!--    <ol-view :center="[40, 40]" :zoom="5" projection="EPSG:4326" />-->
<!--    <ol-tile-layer>-->
<!--      <ol-source-osm />-->
<!--    </ol-tile-layer>-->
  </ol-map>
</template>

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

const mapRef = ref(null);
const trackData = ref(null);
const loading = ref(true);
const error = ref(null);
let map = null;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const fetchTrackData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await axios.get('http://localhost:3000/latest');
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

const initializeMap = () => {
  if (!trackData.value || !trackData.value.track.points.length) return;

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
    target: mapRef.value,
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vectorLayer
    ],
    view: new View({
      center: fromLonLat([
        trackData.value.track.points[0].longitude,
        trackData.value.track.points[0].latitude
      ]),
      zoom: 14
    })
  });
  console.log(map)

  const trackFeature = createTrackFeature(trackData.value.track.points);
  const pointFeatures = createStartEndPoints(trackData.value.track.points);

  vectorSource.addFeature(trackFeature);
  pointFeatures.forEach(feature => vectorSource.addFeature(feature));
};

onMounted(async () => {
  await fetchTrackData();
  if (trackData.value) {
    initializeMap();
  }
});
</script>

<style scoped>
@import "@/assets/main.css";
</style>