import { normalize, arrayOf } from 'normalizr';
import { location } from "./../schema";

import Immutable from 'seamless-immutable';
import store from "./../store/store";

const defaultState = Immutable({
  fetching: false,
  fetched: false,
  error: null,
  locations: [],
  current_location_id: null,
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "FETCH_LOCATIONS_PENDING": {
      return state.merge({fetching: true});
    }
    case "FETCH_LOCATIONS_REJECTED": {
      return state.merge({fetching: false, error: action.payload});
    }
    case "FETCH_LOCATIONS_FULFILLED": {
      const response = normalize({locations: action.payload.data}, {
        locations: arrayOf(location)
      });
      return state.merge({locations: {entities: response.entities.locations, result: response.result.locations}, fetching: false, fetched: true});
    }
    case "SET_ACTIVE_LOCATION": {
      // let location = null;
      // if (state.locations.result) {
      //   state.locations.result.forEach((locationId) => {
      //     if (state.locations.entities[locationId].id.$oid == action.payload) {
      //       location = state.locations.entities[locationId];
      //     }
      //   });
      // }
      // // if (location) {
      // //   setTimeout(function() {
      // //     store.dispatch(fetchMeasures(action.payload, store.getState().measure.currenttimestamp, store.getState().measure.timeinterval));
      // //   }.bind(this), 0);
      // // }
      return state.merge({current_location_id: action.payload});
    }
  }
  return state;
};
