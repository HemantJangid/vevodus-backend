const DBUtil = require('./DBUtil');

exports.getBroaderCategory = (callback) =>{
	var query = "select * from VD_CATEGORY";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback(recordsets['recordset']);
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}

	});

};


exports.getAllBrands = (callback) =>{
	var query = "select * from VD_BRAND";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback(recordsets['recordset']);
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}

	});

};

exports.createNewBrand = (callback) => {
	var query = "select * from VD_BRAND";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback(recordsets['recordset']);
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}

	});
};