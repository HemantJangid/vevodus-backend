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

exports.changeStatusProduct = (callback, productAttr) =>{
	var query = "UPDATE VD_PRODUCT SET VERIFIED = "+ productAttr.isverified + " WHERE PRODUCT_ID in (" + productAttr.productids +")";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}
	});
}

exports.changeLiveStatusProduct = (callback, productAttr) =>{
	var query = "UPDATE VD_PRODUCT SET IS_LIVE = "+ productAttr.isverified + " WHERE PRODUCT_ID in (" + productAttr.productids +")";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}
	});
}

exports.changeQuantity = (callback, quantity) =>{
	var query = "update VD_PRODUCT set quantity = " + productAttr.quantity + "where product_id= " + productAttr.productid;
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error");
			console.log("Internl server error" + err);
		}
	});
}

exports.getPhotosLink = (callback, productid) =>{
	var query = "select * from VD_PRODUCT_PHOTO where product_id = " + productid;
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

exports.getProductAttrs = (callback, productid) =>{
	var query = "select * from VD_PRODCUT_ATTRIBUTES where product_id =  " + productid;
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

