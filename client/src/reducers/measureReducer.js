import { normalize, arrayOf } from 'normalizr';
import { location, measure } from "./../schema";

import store from "./../store/store";

import { fetchMeasures } from "./../actions/measureActions";
import { fetchSnapshots } from "./../actions/snapshotActions";

import serverConfig from "./../config/server";


const defaultState = {
  fetching: false,
  fetched: false,
  error: null,
  measures: {},
  measure: null,
  current_time_stamp: parseInt(new Date().valueOf() * 0.001),
  time_interval: 60 * 60 * 24,
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "FETCH_MEASURES_PENDING": {
      return {...state, fetching: true};
    }
    case "FETCH_MEASURES_REJECTED": {
      return {...state, fetching: false, error: action.payload};
    }
    case "FETCH_MEASURES_FULFILLED": {
      const response = normalize({measures: action.payload.data}, {
        measures: arrayOf(measure)
      });
      return {...state, measures: {entities: response.entities.measures, result: response.result.measures}, fetching: false, fetched: true};
    }
    case "RESET_MEASURES": {
      return {...state, measures: {}};
    }
    case "SET_CURRENT_TIME_STAMP": {
      return {...state, current_time_stamp: action.payload};
    }
    case "SET_TIME_INTERVAL": {
      return {...state, time_interval: Math.max(action.payload, serverConfig.uMeasureIntervalMin)};
    }
    case "POST_MEASURES_PENDING": {
      return {...state, fetching: true};
    }
    case "POST_MEASURES_REJECTED": {
      return {...state, fetching: false, error: action.payload};
    }
    case "POST_MEASURES_FULFILLED": {
      setTimeout(function() {
        store.dispatch(fetchMeasures(store.getState().location.current_location_id, action.payload.data.timestamp, action.payload.data.interval));
        store.dispatch(fetchSnapshots(store.getState().location.current_location_id));
      }.bind(this), 0);
      document.querySelector('#measure-import-message').innerHTML = action.payload.data.datasize + " " + store.getState().localization.localization.dataimportmessage + " " + action.payload.data.snapshotsize + " " + store.getState().localization.localization.snapshotimportmessage;
      setTimeout(function() {
        if (document.querySelector('#measure-import-message')) {
          document.querySelector('#measure-import-message').innerHTML = "";
        }
      }.bind(this), 5000);
      return {...state, current_time_stamp: action.payload.data.timestamp, time_interval: action.payload.data.interval, fetching: false, fetched: true}
      // return {...state, measures: {entities: response.entities.measures, result: response.result.measures}, fetching: false, fetched: true};
    }
  }
  return state;
};
