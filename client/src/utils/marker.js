import * as L from 'leaflet';
import store from "./../store/store";

import { google10Color } from "./../utils/color";

// import './marker.scss';

export function createLocationMarker(props) {
  let marker = new L.circle(new L.LatLng(props.location.latitude, props.location.longitude), 4, {
    stroke: true,
    color: "#ffffff",
    weight: 2,
    opacity: 1,
    fillColor: "#ffffff",
    fillOpacity: 0.75,
  });
  marker.on('click', function() {
    store.dispatch({type: "PUSH_ROUTE", payload: {path: "LOCATION", locationId: props.location.id.$oid}});
  });
  return marker;
}
