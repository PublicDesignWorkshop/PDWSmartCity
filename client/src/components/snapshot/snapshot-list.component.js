import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
import store from "./../../store/store";

require('./snapshot-list.component.scss');

import { fetchSnapshots } from "./../../actions/snapshotActions";
import SnapshotItem from "./snapshot-item.component";

@connect((store) => {
  return {
    localization: store.localization,
    snapshot: store.snapshot,
  }
})
export default class SnapshotList extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }
  componentWillMount() {
    setTimeout(function() {
      this.props.dispatch(fetchSnapshots(store.getState().location.current_location_id));
    }.bind(this), 0);
  }
  componentDidMount() {

  }
  componentWillReceiveProps(nextProps) {

  }
  render() {
    let snapshots;
    if (this.props.snapshot.snapshots.result) {
      snapshots = this.props.snapshot.snapshots.result.map((snapshot_id, index) => {
        return <SnapshotItem key={"snapshot-" + index} snapshot={this.props.snapshot.snapshots.entities[snapshot_id]} />
      });
    }
    const { localization } = this.props.localization;

    return(
      <div className="snapshot-list">
        <div className="title">
          {localization.snapshottitle}
        </div>
        <div className="body">
          {snapshots}
        </div>
      </div>
    );
  }
}
