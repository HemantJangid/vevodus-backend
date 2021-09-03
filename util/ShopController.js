const DBUtil = require('./DBUtil');

//exports.healthCheck = () =>{

exports.getShopDetails = (callback, userID) =>{
	console.log(userID + "checking");
	var query =  'select shop.SHOP_ID, shop.NAME, shop.LAT, shop.lang, shop.ADRESS, shop.LOCATION_ID, shop.BROADER_CATEGORY, shop.GST from VD_SHOP as shop inner join VD_SHOP_OWNER as sowner on shop.verified = 1 and sowner.USER_ID =' + userID;
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
//}