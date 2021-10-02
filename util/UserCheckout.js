const DBUtil = require('./DBUtil');

exports.getActiveUserCheckoutDetails = (callback, checkoutAttrs) =>{
	var query = "select p.NAME as name, p.MRP as mrp, p.SP as sp, p.CATEGORY_ID as categoryId, p.PRODUCT_SPECIFICATION as productSpecification ,p.PHOTO_LINK as photoLink ,CHECKOUT_ID as checkoutId, USER_ID as userId, p.PRODUCT_ID as productId, STATUS as status, ud.Quantity as quantity, Date_ORDERED as dateOrdered  from VD_PRODUCT as p inner join VD_USER_CHECKOUT as ud on p.PRODUCT_ID = ud.PRODUCT_ID and ud.USER_ID = " +checkoutAttrs + " and (ud.status = 'A' or ud.status = 'N') order by ud.Date_ORDERED;";
	//var query =  "select CHECKOUT_ID as checkoutID, USER_ID as userID, PRODUCT_ID as productId, STATUS as status, Quantity as quantity, Date_ORDERED as dateOrdered from VD_USER_CHECKOUT where USER_ID = " + checkoutAttrs + "and (status = 'A' or status = 'N') order by Date_ORDERED";
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
	var query = "select p.NAME as name, p.MRP as mrp, p.SP as sp, p.CATEGORY_ID as categoryId, p.PRODUCT_SPECIFICATION as productSpecification ,p.PHOTO_LINK as photoLink ,CHECKOUT_Id as checkoutId, USER_ID as userId, p.PRODUCT_ID as productId, STATUS as status, ud.Quantity as quantity, Date_ORDERED as dateOrdered  from VD_PRODUCT as p inner join VD_USER_CHECKOUT as ud on p.PRODUCT_ID = ud.PRODUCT_ID and ud.USER_ID = " +checkoutAttrs + " and (ud.status = 'D' or ud.status = 'X' or ud.status = 'C') order by ud.Date_ORDERED;";
	//var query =  "select CHECKOUT_ID as checkoutID, USER_ID as userID, PRODUCT_ID as productId, STATUS as status, Quantity as quantity, Date_ORDERED as dateOrdered from VD_USER_CHECKOUT where USER_ID = " + checkoutAttrs + "and (status = 'D' or status = 'X' or status = 'C') order by Date_ORDERED";
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

exports.getParticularCheckout = (orderID) =>{
	var query = "select p.NAME as name, p.MRP as mrp, p.SP as sp, p.CATEGORY_ID as categoryId, p.PRODUCT_SPECIFICATION as productSpecification ,p.PHOTO_LINK as photoLink ,CHECKOUT_ID as checkoutId, USER_ID as userId, p.PRODUCT_ID as productId, STATUS as status, ud.Quantity as quantity, Date_ORDERED as dateOrdered  from VD_PRODUCT as p inner join VD_USER_CHECKOUT as ud on p.PRODUCT_ID = ud.PRODUCT_ID and ud.CHECKOUT_ID = " +orderID + "  order by ud.Date_ORDERED;";
	return query;
}
