const DBUtil = require('./DBUtil');

exports.getBroaderCategory = (callback) =>{
	var query = "select distinct CATEGORY_NAME from VD_CATEGORY";
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