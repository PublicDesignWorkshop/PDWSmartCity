import { normalize, arrayOf } from 'normalizr';
import { location, measure, snapshot } from "./../schema";

import store from "./../store/store";

import serverConfig from "./../config/server";

const defaultState = {
  fetching: false,
  fetched: false,
  error: null,
  snapshots: {},
  current_snapshot_id: null,
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "FETCH_SNAPSHOTS_PENDING": {
      return {...state, fetching: true};
    }
    case "FETCH_SNAPSHOTS_REJECTED": {
      return {...state, fetching: false, error: action.payload};
    }
    case "FETCH_SNAPSHOTS_FULFILLED": {
      const response = normalize({snapshots: action.payload.data}, {
        snapshots: arrayOf(snapshot)
      });
      // console.log(response);
      return {...state, snapshots: {entities: response.entities.snapshots, result: response.result.snapshots}, fetching: false, fetched: true};
    }
  }
  return state;
};
