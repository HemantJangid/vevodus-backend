const DBUtil = require('./DBUtil');





exports.addProducts = (callback, userDetails) =>{
	var query = "select a.USER_ID, a.Name, a.EMAILADRESS, a.MOBILE from VD_USER_PROFILE as a inner join USER_PASSWORD as b on a.USER_ID = b.USER_ID and b.PASSWORD = '" + userDetails.password + "' and a.MOBILE='" + userDetails.mobile + "'";
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

exports.getProducts = (callback, shopID) =>{
	var query = "select * from VD_PRODUCT where PRODUCT_ID in (SELECT PRODUCT_ID FROM VD_PRODUCT_DETAILS where shop_id = " + shopID + ")";
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


