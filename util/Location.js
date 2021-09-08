const DBUtil = require('./DBUtil');

exports.getLocationID = (locationID) =>{
	var query =  'select LOCATION_ID from VD_LOCATION where PINCODE = ' + locationID;
	return query;
}

exports.getAllPinCodes = (callback) =>{
	var query =  'select PINCODE as pincode from VD_LOCATION';
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback(recordsets['recordset']);
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}
	});
}