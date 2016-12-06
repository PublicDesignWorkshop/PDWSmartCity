let config = {
 "uLocalization": "/localizations/",
 "sServerDateFormat": "YYYY-MM-DD HH:mm:ss",
 "sUIDateFormat": "MMM D, YYYY hh:mm:ssA",

 "uStreetTileMap": "//api.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png256?access_token=",
 "uStreetTileToken": "pk.eyJ1IjoiY29uY3JldGUtanVuZ2xlIiwiYSI6InViLW5INU0ifQ.radc95S2bnienvUpDkl49A",
 "minMapZoom": 13,
 "defaultMapZoom": 18,
 "maxMapZoom": 19,
 "defaultLocation": {
   latitude: 33.771238,
   longitude: -84.388842
 },

  "uServer": "http://localhost:1880",
  "uLocations": "/locations",
  "uMeasuresSearch": "/measures/search",
  "uMeasuresUpload": "/measures/upload",
  "uServerDataFormat": ".json",

  "uMeasureIntervalMin": 60 * 60,

  "uSnapshotsSearch": "/snapshots/search",
};

export default config;
