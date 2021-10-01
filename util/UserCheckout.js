const DBUtil = require('./DBUtil');

exports.getActiveUserCheckoutDetails = (callback, checkoutAttrs) =>{
	var query =  "select CHECKOUT_ID as checkoutID, USER_ID as userID, PRODUCT_ID as productId, STATUS as status, Quantity as quantity, Date_ORDERED as dateOrdered from VD_USER_CHECKOUT where USER_ID = " + checkoutAttrs + "and status = 'A' order by Date_ORDERED";
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

exports.getPastUserCheckoutDetails = (callback, checkoutAttrs) =>{
	var query =  "select CHECKOUT_ID as checkoutID, USER_ID as userID, PRODUCT_ID as productId, STATUS as status, Quantity as quantity, Date_ORDERED as dateOrdered from VD_USER_CHECKOUT where USER_ID = " + checkoutAttrs + "and (status = 'D' or status = 'X' or status = 'C') order by Date_ORDERED";
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