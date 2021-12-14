const DBUtil = require('./DBUtil');


exports.authenticate = (callback, userDetails) =>{
	var query = "select userRole.role, v.userId, v.name, v.emailAddress, v.mobile, v.quota from ( select a.USER_ID as userId, a.Name as name, a.EMAILADRESS as emailAddress, a.MOBILE as mobile, a.QOUTA as quota from VD_USER_PROFILE as a inner join USER_PASSWORD as b on a.USER_ID = b.USER_ID and b.PASSWORD = '" + userDetails.password + "'  COLLATE Latin1_General_CS_AS and a.MOBILE='" + userDetails.mobile + "') as v inner join USER_ROLE as userRole on v.userId = userRole.user_id";
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


  

exports.authenticate2 = (callback, userDetails) =>{
	var query = "select USER_ID as userId from VD_OTP  where OTP = '" + userDetails.otp + "' and USER_ID in (select USER_ID from VD_USER_PROFILE where MOBILE = " +userDetails.mobile+")";
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

exports.userDetailsInfo = (callback, userid) =>{
	var query = "select USER_ID as userId, NAME as name, mobile as mobile, EMAILADRESS as emailAddress, QOUTA as qouta from VD_USER_PROFILE where USER_ID=" +userid;
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

exports.getUserCity = (callback, userId) =>{
	var query =   "select * from VD_CITIES where CITY_ID = (select city_id from VD_LOCATION where LOCATION_ID = ( select LOCATION_ID from VD_USER_ADRESS where USER_ID ="  + userId +"))";
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
}


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

exports.addCheckout = (callback, userID, productID, quantity) =>{
	var query = "INSERT INTO VD_USER_CHECKOUT (USER_ID, PRODUCT_ID, STATUS, Quantity) VALUES (" + userID +","  +  productID + ",'N', " + quantity +");";
	console.log(query);
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


exports.addOTP = (callback, mobile, otp) =>{
	var query =   "  delete from VD_OTP where USER_ID in (select USER_ID from VD_USER_PROFILE where mobile = '" + mobile + "') ; insert into VD_OTP values((select USER_ID from VD_USER_PROFILE where mobile = '" + mobile + "'), '" + otp +"')";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl server error in updating status for checkout" + err);
		}
	});
}

exports.logout = (callback, mobile) =>{
	var query =   "delete from VD_OTP where USER_ID in (select USER_ID from VD_USER_PROFILE where mobile = '" + mobile +"')";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl server error in updating status for checkout" + err);
		}
	});
}




exports.addGift = (callback, userID, text) =>{
	var query = "INSERT INTO VD_USER_GIFT (USER_ID, gift) VALUES (" + userID +" ,'" + text + "');";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl in add Gift  error" + err);
		}

	});
};



