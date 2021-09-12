const DBUtil = require('./DBUtil');


exports.authenticate = (callback, userDetails) =>{
	var query = "select a.USER_ID as userId, a.Name as name, a.EMAILADRESS as emailAddress, a.MOBILE as mobile, a.QOUTA as quota from VD_USER_PROFILE as a inner join USER_PASSWORD as b on a.USER_ID = b.USER_ID and b.PASSWORD = '" + userDetails.password + "' COLLATE Latin1_General_CS_AS and a.MOBILE='" + userDetails.mobile + "'";
	console.log(query);
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

exports.addNewUser = (userAttrs) => {
	var query = "insert into VD_USER_PROFILE(NAME, MOBILE, EMAILADRESS, QOUTA)" 
	query += " values ('" + userAttrs['shopOwnerName'] +"','" + userAttrs['mobile']+ "','" + userAttrs['emailAddress']+"',50); SELECT SCOPE_IDENTITY() as userid;";
	return query;
}

exports.addUserAddress = (userAttrs) => {
	var query = "insert into VD_USER_ADRESS(USER_ID, ADRESS, NEAR_BY_LANDMARK, LOCATION_ID, DEFAULT_ADRESS) " 
	query += " values (" + userAttrs['userID'] +",'" + userAttrs['address']+ "','" + userAttrs['nearBYAddress']+"', "+ userAttrs['locationID'] +" , " + 1 +");";
	return query;
}

exports.addUserRoleMapped = (userAttrs) => {
	var query = "insert into USER_ROLE(USER_ID, ROLE) " 
	query += " values (" + userAttrs['userID'] +",'" + userAttrs['role']+ "');";
	return query;
}
exports.addNewUserPassword = (userAttrs) => {
	var query = "insert into USER_PASSWORD(USER_ID, PASSWORD) " 
	query += " values (" + userAttrs['userID'] +",'" + userAttrs['password']+ "');";
	return query;
}

exports.addUserPhoto = (callback, productID, photoAdress, isverified) =>{
	var query = "INSERT INTO USER_PHOTO (USER_ID, PHOTO_ADRESS, VERIFIED) VALUES (" + productID +",'"  +  photoAdress + "'," +  isverified + ");";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl in shop image  error" + err);
		}

	});
};

exports.addCheckout = (callback, userID, productID) =>{
	var query = "INSERT INTO VD_USER_CHECKOUT (USER_ID, PRODUCT_ID, STATUS) VALUES (" + userID +","  +  productID + ",'N');";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl in checkout image  error" + err);
		}

	});
};


exports.changeStatusCheckout = (callback, checkoutID, status) =>{
	var query = "UPDATE VD_USER_CHECKOUT SET status = '"+ status + "' WHERE CHECKOUT_ID in (" + checkoutID +")";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error in updating status for checkout" + err);
		}
	});
}

exports.getUserInfo = (userId) => {
	var query = "select USER_ID as userId, NAME as name, mobile as mobile, EMAILADRESS as emailAddress, QOUTA as qouta from VD_USER_PROFILE where USER_ID=" +userId;
	return query;
}

exports.uniqueUser = (mobile) => {
	var query = " select * from VD_USER_PROFILE where MOBILE = '" + mobile + "';";
	return query;
}



