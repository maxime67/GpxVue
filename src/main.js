import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import "vue3-openlayers/styles.css";
import OpenLayersMap from "vue3-openlayers";
import router from "@/router/index.js";

const app = createApp(App);

app.use(OpenLayersMap /*, options */);
app.use(router);

app.mount('#app')
