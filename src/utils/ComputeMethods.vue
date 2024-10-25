<script>


import * as geolib from "geolib";

export const calculateAverageSpeed = (distanceInKm, timeInHours) => {
  return Number(distanceInKm / timeInHours).toFixed(3);
};

export const computeAllDistance = (points) => {
  var dist = 0;
  if (!points.length) return 0;
  points.forEach((point, i) => {
    if(points[i+1]) {
      dist += geolib.getDistance(
          points[i], points[i + 1]
      )
    }
  })
  return Number(dist).toFixed(2);
};

export const calculateElevationGain = (points) => {
  if (!points.length) return 0;
  let gain = 0;
  for (let i = 1; i < points.length; i++) {
    const elevationDiff = points[i].elevation - points[i-1].elevation;
    if (elevationDiff > 0) gain += elevationDiff;
  }
  return Math.round(gain);
};

export const renderTimeDuration = (milliSeconds) => {

  const hours = Math.floor(milliSeconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliSeconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliSeconds % (1000 * 60)) / 1000);
  return `${hours}:${minutes}:${seconds}`
}
export const getTimeDurationInHours = (track) => {
  return getTimeDuration(track) / (1000 * 60 * 60);
}
export const getTimeDuration = (track) => {
  const points = track.track.points
  if (!points.length) return [];
  const startTime = points[0].time;
  const endTime = points[points.length - 1].time;
  // Return time difference in milliseconds
  return new Date(endTime) - new Date(startTime);
}

</script>
