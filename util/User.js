const DBUtil = require('./DBUtil');


exports.authenticate = (callback, userDetails) =>{
	var query = "select a.USER_ID, a.Name, a.EMAILADRESS, a.MOBILE, a.QOUTA from VD_USER_PROFILE as a inner join USER_PASSWORD as b on a.USER_ID = b.USER_ID and b.PASSWORD = '" + userDetails.password + "' and a.MOBILE='" + userDetails.mobile + "'";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback(recordsets['recordset']);
		}
		else{
			callback("ERROR");
			console.log("Internl server error" + err);
		}

	});

};

