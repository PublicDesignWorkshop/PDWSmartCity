import Immutable from 'seamless-immutable';
import store from "./../store/store";

const defaultState = Immutable({
  fetching: false,
  fetched: false,
  error: null,
  localization: {},
});

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "FETCH_LOCALIZATION_PENDING": {
      return state.merge({fetching: true});
    }
    case "FETCH_LOCALIZATION_REJECTED" : {
      return state.merge({fetching: false, error: action.payload});
    }
    case "FETCH_LOCALIZATION_FULFILLED" : {
      return state.merge({fetching: false, fetched: true, localization: action.payload.data});
    }
  }
  return state;
};
