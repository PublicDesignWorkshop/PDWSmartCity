import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";

require('./header.component.scss');

@connect((store) => {
  return {
    localization: store.localization,
  }
})
export default class Header extends React.Component {
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
    const { localization } = this.props.localization;
    return(
      <div className="header">
        <div className="left">
          <div className="logo">
          </div>
          <div className="sitename">
            { localization.sitename }
          </div>
        </div>
        <div className="center">
        </div>
        <div className="right">
        </div>
      </div>
    );
  }
}
