import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
import FontAwesome from "react-fontawesome";

import Map from "./../map/map.component";

import { fetchMeasures, postMeasures } from "./../../actions/measureActions";

import SensorGraph from "./../sensor/sensor-graph.component";
import SnapshotList from "./../snapshot/snapshot-list.component";

require('./location.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
    location: store.location,
    measure: store.measure,
  }
})
export default class Location extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }
  componentWillMount() {
    setTimeout(function() {
      this.props.dispatch({type: "SET_ACTIVE_LOCATION", payload: this.props.params.locationId});
      this.props.dispatch(fetchMeasures(this.props.params.locationId, this.props.measure.current_time_stamp, this.props.measure.time_interval));
    }.bind(this), 0);
  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {

  }
  handleClosePopup(event) {
    this.props.dispatch({type: "RESET_MEASURES"});
    this.props.dispatch({type: "PUSH_ROUTE", payload: {path: "HOME"}});
  }
  handleFileUpload(event) {
    if (event.target.files[0] != null) {
      try {
        let r = new FileReader();
        r.onload = function(event) {
          let contents = event.target.result.split("\n");
          const data = contents.filter((item) => {
            return item.split(" ").length > 1;
          });
          const snapshots = contents.filter((item) => {
            return item.split(" ").length == 1;
          });
          // console.log(data, snapshots);
          this.props.dispatch(postMeasures(this.props.location.current_location_id, data, snapshots));
          // console.log(contents.split("\n"));
        }.bind(this);
        r.readAsText(event.target.files[0]);
      } catch(error) {

      }
      document.querySelector("#measure-import").value = "";
    }
  }
  render() {
    let location = null;
    if (this.props.location.locations.result) {
      this.props.location.locations.result.forEach((location_id) => {
        if (this.props.location.locations.entities[location_id].id.$oid == this.props.location.current_location_id) {
          location = this.props.location.locations.entities[location_id];
        }
      });
    }

    const { localization } = this.props.localization;
    let environment = localization.outdoor;
    if (localization.inside) {
      environment = localization.indoor;
    }

    const sensors = [];

    sensors.push({type: "light", data: []});
    sensors.push({type: "noise", data: []});
    sensors.push({type: "temperature", data: []});
    sensors.push({type: "humidity", data: []});
    sensors.push({type: "pressure", data: []});

    if (this.props.measure.measures.result) {
      this.props.measure.measures.result.forEach((measure_id) => {
        let list = sensors.filter((sensor) => {
          return sensor.type == this.props.measure.measures.entities[measure_id].type;
        });
        if (list.length > 0) {
          list[0].data.push(this.props.measure.measures.entities[measure_id]);
        } else {
          sensors.push({type: this.props.measure.measures.entities[measure_id].type, data: [this.props.measure.measures.entities[measure_id]]});
        }
      });
    }

    const graphs = sensors.map((sensor, index) => {
      return <SensorGraph key={"sensor-graph-" + index} sensor={sensor} />;
    });

    if (location) {
      return(
        <div className="location">
          <Map />
          <div className="popup">
            <div className="title">
              <span>{location.address}</span>
              <span>{location.name}</span>
              <span>{environment}</span>
              <span>@ {location.latitude}, {location.longitude}</span>
              <span className="button" onClick={this.handleClosePopup.bind(this)}><FontAwesome name="close" /></span>
            </div>
            <div className="body">
              <div className="fileupload">
                <label className="label" htmlFor="measure-import">{localization.importdata}</label>
                <input type="file" id="measure-import" accept=".pdw" onChange={this.handleFileUpload.bind(this)}/>
                <div id="measure-import-message"></div>
              </div>
              {graphs}
              <SnapshotList />
            </div>
          </div>
        </div>
      );
    }
    return(
      <div className="location">
        <Map />
      </div>
    );
  }
}
