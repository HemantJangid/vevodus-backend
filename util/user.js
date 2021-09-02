const DBUtil = require('./DBUtil');
DBUtil.query('select * from VD_STATES', (err, recordsets) => {

  console.log(recordsets);

  // Handle recordsets logic

});