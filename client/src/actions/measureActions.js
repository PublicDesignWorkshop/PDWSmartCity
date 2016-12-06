import axios from "axios";

import serverConfig from "./../config/server";

export function fetchMeasures(locaiton_id, timestamp, interval) {
  // console.log(locaiton_id, timestamp, interval);
  return {
    type: "FETCH_MEASURES",
    payload: axios.get(serverConfig.uServer + serverConfig.uMeasuresSearch + "/" + locaiton_id + "/" + timestamp + "/" + interval + serverConfig.uServerDataFormat),
  }
}

export function postMeasures(locaiton_id, data, snapshots) {
  var config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  };
  return {
    type: "POST_MEASURES",
    payload: axios.post(serverConfig.uServer + serverConfig.uMeasuresUpload + "/" + locaiton_id + serverConfig.uServerDataFormat, {
      data: data,
      snapshots: snapshots,
    }, config),
  }
}
