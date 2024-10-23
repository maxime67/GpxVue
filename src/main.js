import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import "vue3-openlayers/styles.css";


const app = createApp(App);

import OpenLayersMap from "vue3-openlayers";
app.use(OpenLayersMap /*, options */);

app.mount('#app')
