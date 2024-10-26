<script>
import {Feature} from "ol";
import {LineString, Point} from "ol/geom.js";
import {fromLonLat} from "ol/proj.js";
import {Circle, Fill, Stroke, Style} from "ol/style.js";

export const createStartEndPoints = (points) => {
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
      fill: new Fill({color: 'green'}),
      stroke: new Stroke({color: 'white', width: 2})
    })
  }));

  endPoint.setStyle(new Style({
    image: new Circle({
      radius: 7,
      fill: new Fill({color: 'red'}),
      stroke: new Stroke({color: 'white', width: 2})
    })
  }));

  return [startPoint, endPoint];
};
export const createTrackFeature = (points) => {
  const coordinates = points.map(point =>
      fromLonLat([point.longitude, point.latitude])
  );

  return new Feature({
    geometry: new LineString(coordinates)
  });
};

</script>

