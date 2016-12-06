import React from "react";
import ReactDom from "react-dom";
import { connect } from "react-redux";
import store from "./../../store/store";

// import moment from 'moment';
import { getMousePosition } from "./../../utils/graph";
import { google10Color } from "./../../utils/color";

require('./sensor-graph.component.scss');

import { fetchMeasures } from "./../../actions/measureActions";


@connect((store) => {
  return {
    localization: store.localization.localization,
  }
})
export default class SensorGraph extends React.Component {
  constructor() {
    super();
    this.state = {
      width: 0,
      height: 0,
      timeoutduration: 100,
    };
    this.chart = null;
    this.timeout = null;
  }
  componentWillMount() {

  }
  componentDidMount() {
    const wrapper = ReactDom.findDOMNode(this.refs['wrapper']);
    const title = ReactDom.findDOMNode(this.refs['title']);
    this.setState({width: wrapper.clientWidth, height:  wrapper.clientHeight - title.clientHeight});
    const canvas = ReactDom.findDOMNode(this.refs['canvas']);
    // canvas.addEventListener('click', function(event) {
    //   let mousePos = getMousePosition(canvas, event);
    //   this.props.dispatch({type: "SET_MOUSE_EVENT", payload: event});
    // }.bind(this), false);

    setTimeout(function() {
      this.renderGraph(this.props);
    }.bind(this), 100);
  }
  componentWillReceiveProps(nextProps) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(function() {
      this.updateGraph(nextProps);
    }.bind(this), this.state.timeoutduration);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }
  updateGraph(props) {
    // console.log(store.getState().measure.current_time_stamp, store.getState().measure.time_interval);
    if (this.chart) {
      const list = props.sensor.data.map((item) => {
        return {x: item.timestamp * 1000, y: item.value}
      });
      if (list.length > 0) {
        list.unshift({x: (store.getState().measure.current_time_stamp - store.getState().measure.time_interval) * 1000, y: list[0].y});
        list.push({x: (store.getState().measure.current_time_stamp + store.getState().measure.time_interval) * 1000, y: list[list.length - 1].y});
      } else {
        list.unshift({x: (store.getState().measure.current_time_stamp - store.getState().measure.time_interval) * 1000, y: 0});
        list.push({x: (store.getState().measure.current_time_stamp + store.getState().measure.time_interval) * 1000, y: 0});
      }


      delete this.chart.datasets[0].points;
      this.chart.datasets[0].points = [];
      for (let i=0; i<list.length; i++) {
        this.chart.datasets[0].addPoint(list[i].x, list[i].y);
      }
      this.chart.options.timecurrent = store.getState().measure.current_time_stamp * 1000;
      this.chart.update();
    }
  }
  renderGraph(props) {
    const canvas = ReactDom.findDOMNode(this.refs['canvas']);
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const list = props.sensor.data.map((item) => {
        return {x: item.timestamp * 1000, y: item.value}
      });
      if (list.length > 0) {
        list.unshift({x: (store.getState().measure.current_time_stamp - store.getState().measure.time_interval) * 1000, y: list[0].y});
        list.push({x: (store.getState().measure.current_time_stamp + store.getState().measure.time_interval) * 1000, y: list[list.length - 1].y});
      } else {
        list.unshift({x: (store.getState().measure.current_time_stamp - store.getState().measure.time_interval) * 1000, y: 0});
        list.push({x: (store.getState().measure.current_time_stamp + store.getState().measure.time_interval) * 1000, y: 0});
      }


      let data = [
        {
          label: props.sensor.type,
          strokeColor: google10Color(props.sensor.type.charCodeAt(0)),
          pointColor: google10Color(props.sensor.type.charCodeAt(0)),
          pointStrokeColor: google10Color(props.sensor.type.charCodeAt(0)),
          data: list,
        }
      ];

      this.chart = new Chart(ctx).Scatter(data, {
          tooltipEvents: ['click', 'mousewheel', 'mousemove'],
          axisStrokeWidth: 4,
          axisStrokeColor: "#cccccc",
  				showTooltips: true,
          showCustomClickEvent: true,
          showCustomClickEventCallback: function(timestamp) {
            props.dispatch({type: "SET_CURRENT_TIME_STAMP", payload: parseInt(timestamp * 0.001)});
            props.dispatch(fetchMeasures(store.getState().location.current_location_id, parseInt(timestamp * 0.001), store.getState().measure.time_interval));
          }.bind(this),
          showCustomScrollEvent: true,
          showCustomScrollEventCallback: function(scroll) {
            if (scroll > 0) {
              props.dispatch({type: "SET_TIME_INTERVAL", payload: store.getState().measure.time_interval + 60 * 60});
            } else {
              props.dispatch({type: "SET_TIME_INTERVAL", payload: store.getState().measure.time_interval - 60 * 60});
            }
            if (this.timeout) {
              clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function() {
              setTimeout(function() {
                this.props.dispatch(fetchMeasures(store.getState().location.current_location_id, store.getState().measure.current_time_stamp, store.getState().measure.time_interval));
              }.bind(this), 100);
            }.bind(this), this.state.timeoutduration);
          }.bind(this),
          timecurrent: store.getState().measure.current_time_stamp * 1000,
          pointDot: false,

  				scaleShowHorizontalLines: true,
  				scaleShowLabels: true,
  				scaleType: "date",

          bezierCurve: true,
          bezierCurveTension: 0.025,
          datasetStrokeWidth: 1,

          // xScaleOverride: true,
          // xScaleSteps: 10,
          // xScaleStepWidth: 10 * 1000,
          // xScaleStartValue: new Date().valueOf() - 10 * 10 * 1000,

          // String - short date format (used for scale labels)
          scaleDateFormat: "mmm d",
          // String - short time format (used for scale labels)
          scaleTimeFormat: "HH:MM:ss",
          // String - full date format (used for point labels)
          scaleDateTimeFormat: "HH:MM:ss",

          emptyDataMessage: "There is no recent 15 munutes of data.",

          useUtc: false,

          pointHitDetectionRadius: 2,

          // // Boolean - If we want to override with a hard coded y scale
          // scaleOverride: true,
          // // ** Required if scaleOverride is true **
          // // Number - The number of steps in a hard coded y scale
          // scaleSteps: 5,
          // // Number - The value jump in the hard coded y scale
          // scaleStepWidth: 20,
          // // Number - The y scale starting value
          // scaleStartValue: 0,

        }
      );
    }
  }
  componentWillUnmount() {

  }

  render() {
    const style = {
      width: this.state.width,
      height: this.state.height
    };
    return <div ref="wrapper" className="sensor-graph">
      <div ref="title" className="title">{this.props.sensor.type}</div>
      <canvas ref="canvas" className="body" style={style} />
    </div>;
  }
}
