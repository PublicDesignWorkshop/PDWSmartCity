import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import moment from 'moment';
import serverConfig from "./../../config/server";
import { google10Color } from "./../../utils/color";


require('./snapshot-item.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
  }
})
export default class SnapshotItem extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }
  componentWillMount() {

  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {

  }
  render() {
    let sensors = [];
    sensors.push({type: "light"});
    sensors.push({type: "noise"});
    sensors.push({type: "temperature"});
    sensors.push({type: "humidity"});
    sensors.push({type: "pressure"});

    const list = sensors.map((item, index) => {
      const style = {
        backgroundColor: google10Color(item.type.charCodeAt(0)),
      }
      console.log(style);
      return <div style={style} key={"sensor-item-" + index} className="sensor-item">{item.type.toUpperCase()}</div>;
    });

    return(
      <div className="snapshot-item">
        <div className="title">{moment(this.props.snapshot.timestamp * 1000).format(serverConfig.sUIDateFormat)}</div>
        {list}
      </div>
    );
  }
}
