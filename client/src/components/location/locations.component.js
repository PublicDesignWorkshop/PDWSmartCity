import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import Map from "./../map/map.component";

require('./locations.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
  }
})
export default class Locations extends React.Component {
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
    return(
      <div className="locations">
        <Map />
      </div>
    );
  }
}
