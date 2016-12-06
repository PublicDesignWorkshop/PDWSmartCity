import axios from "axios";

import serverConfig from "./../config/server";

export function fetchSnapshots(locaiton_id) {
  return {
    type: "FETCH_SNAPSHOTS",
    payload: axios.get(serverConfig.uServer + serverConfig.uSnapshotsSearch + "/" + locaiton_id + serverConfig.uServerDataFormat),
  }
}
