const DBUtil = require('./DBUtil');

exports.getShopDetails = (callback, userID) =>{
	console.log(userID + "checking");
	var query =  'select shop.SHOP_ID as shopId, shop.NAME as shopName, shop.LAT as lat, shop.lang as lang, shop.ADRESS as address, shop.LOCATION_ID as locationId, shop.BROADER_CATEGORY as broaderCategory, shop.GST as gst, shop.VERIFIED as verified, shop.PHOTO_LINK as photoLink from VD_SHOP as shop inner join VD_SHOP_OWNER as sowner on  sowner.USER_ID =' + userID;
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
	var query = " select  NAME as name, LAT as lat, LANG as lang, ADRESS as address, LOCATION_ID as locationId, BROADER_CATEGORY as broaderCategory, GST as gst, VERIFIED as verified, PHOTO_LINK as photoLink from VD_SHOP";
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

exports.getPhotosLink = (callback, productid) =>{
	var query = "select PHOTO_ID as photoId, SHOP_ID as shopId, PHOTO_ADRESS as photoAddress, VERIFIED as verified from SHOP_PHOTO where SHOP_ID = " + productid;
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

exports.addNewShop = (shopAttrs) =>{
	var query = "insert into VD_SHOP(NAME, LAT, LANG, ADRESS, LOCATION_ID, BROADER_CATEGORY, GST, VERIFIED)"
	query += " values('" + shopAttrs['shopName'] + "', '" + shopAttrs['lat'] +"','" + shopAttrs['lang'] +"', '" + shopAttrs['address'] +"'" + shopAttrs['locationID'] +",'" + shopAttrs['broaderCategory'] + "','" + shopAttrs['GST']+"',0); SELECT SCOPE_IDENTITY() as shopid;";
	return query;
}

exports.addUserShopMapped = (userAttrs) => {
	var query = "insert into VD_SHOP_OWNER(SHOP_ID, USER_ID) " 
	query += " values (" + userAttrs['shopID'] +"," + userAttrs['userID']+ ");";
	return query;
}

exports.addShopPhoto = (productID, photoAdress, isverified) =>{
	var query = "INSERT INTO SHOP_PHOTO (SHOP_ID, PHOTO_ADRESS, VERIFIED) VALUES (" + productID +",'"  +  photoAdress + "'," +  isverified + ");";
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

exports.updateDefaultPhotoLink = (shopID, photoLink) =>{
	var query = "UPDATE VD_SHOP SET PHOTO_LINK = '"+ photoLink + "' WHERE SHOP_ID in (" + shopID +")";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error");
			console.log("Adding default link .Internl server error" + err);
		}
	});
}




