import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
import * as L from 'leaflet';

import serverConfig from "./../../config/server";

import { createLocationMarker } from "./../../utils/marker";

require('./map.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
    map: store.map,
    location: store.location,
  }
})
export default class Map extends React.Component {
  constructor() {
    super();
    this.state = {

    };
    this.map = null;
  }
  componentWillMount() {

  }
  componentDidMount() {
    if (!this.props.map.map) {
      this.map = L.map("map", {
        zoomControl: false,
        closePopupOnClick: false,
        doubleClickZoom: false,
        touchZoom: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        minZoom: serverConfig.minMapZoom,
        maxZoom: serverConfig.maxMapZoom,
        // maxBounds: L.latLngBounds([33.770007, -84.391469], [33.772261, -84.386009]),
      }).setView(new L.LatLng(serverConfig.defaultLocation.latitude, serverConfig.defaultLocation.longitude), serverConfig.defaultMapZoom);
      this.props.dispatch({type: "SET_ACTIVE_MAP", payload: this.map});
      this.map.invalidateSize(false);
      this.map.whenReady(this.afterRenderMap.bind(this));
    } else {
      this.map = this.props.map.map;
      if (!this.props.map.markers) {
        this.markers = this.props.map.markers;
      } else {
        this.markers = new L.layerGroup();
        this.props.dispatch({type: "SET_ACTIVE_MARKERS", markers: this.markers});
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    const { locations } = nextProps.location;
    if (this.markers) {
      this.markers.clearLayers();
    } else {
      if (nextProps.map.markers) {
        this.markers = nextProps.map.markers;
      } else {
        this.markers = new L.layerGroup();
      }
    }
    if (locations.result) {
      locations.result.forEach((locationId) => {
        this.markers.addLayer(createLocationMarker({location: locations.entities[locationId]}));
      });
    }
    // this.markers.clearLayers();
    // nextProps.station.list.forEach((stationId) => {
    //   let watch = false;
    //   let active = false;
    //   if (nextProps.station.watch && nextProps.station.watch.id == stationId) {
    //     watch = true;
    //   }
    //   if (nextProps.station.active && nextProps.station.active.id == stationId) {
    //     active = true;
    //   }
    //   this.markers.addLayer(createStationMarker({active: active, watch: watch, station: nextProps.station.stations[stationId]}));
    // });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  componentWillUnmount() {

  }
  afterRenderMap() {
    const tile = L.tileLayer(serverConfig.uStreetTileMap + serverConfig.uStreetTileToken, {
        minZoom: serverConfig.minMapZoom,
        maxZoom: serverConfig.maxMapZoom,
    });
    tile.addTo(this.map);
    this.props.dispatch({type: "SET_ACTIVE_TILE", tile: tile});
    if (this.props.map.markers) {
      this.markers = this.props.map.markers;
    } else {
      this.markers = new L.layerGroup();
      this.props.dispatch({type: "SET_ACTIVE_MARKERS", markers: this.markers});
    }
    this.map.addLayer(this.markers);
  }
  render() {
    return null;
  }
}
