import Immutable from 'seamless-immutable';
import store from "./../store/store";

const defaultState = {
  router: null,
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SET_ROUTER": {
      return {...state, router: action.payload};
    }
    case "PUSH_ROUTE": {
      switch(action.payload.path) {
        case "HOME": {
          state.router.push({pathname: ""});
          return state;
        }
        case "LOCATION": {
          state.router.push({pathname: action.payload.path.toLowerCase() + "/" + action.payload.locationId});
          return state;
        }
      }
      return state;
    }
  }
  return state;
};
