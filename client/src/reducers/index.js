import { combineReducers } from "redux";

import localization from "./localizationReducer";
import router from "./routerReducer";
import map from "./mapReducer";
import location from "./locationReducer";
import measure from "./measureReducer";
import snapshot from "./snapshotReducer";



export default combineReducers({
  localization,
  router,
  map,
  location,
  measure,
  snapshot,
});
