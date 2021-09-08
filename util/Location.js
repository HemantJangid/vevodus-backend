const DBUtil = require('./DBUtil');

exports.getLocationID = (locationID) =>{
	var query =  'select LOCATION_ID from VD_LOCATION where PINCODE = ' + locationID;
	return query;
}