const DBUtil = require('./DBUtil');


exports.authenticate = (callback, userDetails) =>{
	var query = "select a.USER_ID, a.Name, a.EMAILADRESS, a.MOBILE, a.QOUTA from VD_USER_PROFILE as a inner join USER_PASSWORD as b on a.USER_ID = b.USER_ID and b.PASSWORD = '" + userDetails.password + "' COLLATE Latin1_General_CS_AS and a.MOBILE='" + userDetails.mobile + "'";
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
