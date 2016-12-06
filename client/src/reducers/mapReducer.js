const defaultState = {
  map: null,
  tile: null,
  markers: null,
};

export default function reducer(state = defaultState, action) {
  switch (action.type) {
    case "SET_ACTIVE_MAP": {
      return {...state, map: action.payload}
    }
    case "SET_ACTIVE_MARKERS": {
      return {...state, markers: action.payload}
    }
    case "SET_ACTIVE_TILE": {
      return {...state, tile: action.payload}
    }
  }
  return state;
};
