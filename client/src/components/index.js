import "babel-polyfill";

import React from "react";
import ReactDom from "react-dom";
import { Router, Route, IndexRoute, hashHistory } from "react-router";
import { Provider, connect } from "react-redux";
import store from "./../store/store";

import App from "./app/app.component";
import Home from "./home/home.component";
import Locations from "./location/locations.component";
import Location from "./location/location.component";

require('./index.scss');

ReactDom.render(<Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Locations} />
        <Route path="/location/:locationId" component={Location}/>
      </Route>
    </Router>
  </Provider>
, document.querySelector('#app'));
