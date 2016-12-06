import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import Map from "./../map/map.component";

require('./home.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
  }
})
export default class Home extends React.Component {
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
      <div className="home">
        <Map />
      </div>
    );
  }
}
