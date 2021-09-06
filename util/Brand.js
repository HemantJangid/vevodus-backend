const DBUtil = require('./DBUtil');

exports.addNewBrand = (callback, brandName) =>{
	let query = " INSERT INTO VD_BRAND (BRAND_NAME) VALUES ('" + brandName+ "'); SELECT SCOPE_IDENTITY() as primaryKey;";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
			if(recordsets['recordset'] != null) {
				callback(recordsets['recordset'][0]['primaryKey']);
			}
			else{
				callback(null);
			}
			
		}
		else{
			callback(null);
			console.log("Internl server error" + err);
		}

	});

};