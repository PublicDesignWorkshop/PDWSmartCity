import { Schema, arrayOf } from 'normalizr';

function generateMongoDBIdAttribute(entity) {
  return entity.id.$oid;
}
const location = new Schema('locations', { idAttribute: generateMongoDBIdAttribute });
const measure = new Schema('measures', { idAttribute: generateMongoDBIdAttribute });
const snapshot = new Schema('snapshots', { idAttribute: generateMongoDBIdAttribute });

// location.define({
//   locations: arrayOf(location)
// });
// const port = new Schema('ports');
// const sensor = new Schema('sensors');

// An Station has an array of Ports
// station.define({
//   ports: arrayOf(port)
// });

// A Port has one sensor attached
// port.define({
//   sensor: sensor
// });

// sensor.define({
//   data: arrayOf(datum)
// });

export { location, measure, snapshot };
