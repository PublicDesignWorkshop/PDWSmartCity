import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

import { fetchLocalization } from "./../../actions/localizationActions";
import { fetchLocations } from "./../../actions/locationActions";

import Header from "./../header/header.component";

require('./app.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
  }
})
export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {

    };
  }
  componentWillMount() {
    this.props.dispatch({type: "SET_ROUTER", payload: this.props.router});
    this.props.dispatch(fetchLocalization());
    this.props.dispatch(fetchLocations());
  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {

  }
  render() {
    return(
      <div ref="app" className="app">
        <Header />
        <div id="map" className="map" />
        <div className="body">
          {this.props.children}
        </div>
      </div>
    );
  }
}
