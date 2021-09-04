const DBUtil = require('./DBUtil');

exports.getShopDetails = (callback, userID) =>{
	console.log(userID + "checking");
	var query =  'select shop.SHOP_ID, shop.NAME, shop.LAT, shop.lang, shop.ADRESS, shop.LOCATION_ID, shop.BROADER_CATEGORY, shop.GST, shop.VERIFIED from VD_SHOP as shop inner join VD_SHOP_OWNER as sowner on  sowner.USER_ID =' + userID;
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


exports.getAllShops = (callback) => {
	var query = " select  * from VD_SHOP";
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

exports.changeStatusShop = (callback, shopAttr) =>{
	var query = "UPDATE VD_SHOP SET VERIFIED = "+ shopAttr.isVerified + " WHERE SHOP_ID in (" + shopAttr.shopIDs +")";
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

