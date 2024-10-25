<script>

import axios from "axios";


export const fetchTrackData = async (error,loading, trackData) => {
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
</script>
