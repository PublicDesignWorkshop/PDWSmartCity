import axios from "axios";

import serverConfig from "./../config/server";

export function fetchLocations() {
  return {
    type: "FETCH_LOCATIONS",
    payload: axios.get(serverConfig.uServer + serverConfig.uLocations + serverConfig.uServerDataFormat),
  }
}
