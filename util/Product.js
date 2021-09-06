const DBUtil = require('./DBUtil');



exports.addProducts = (callback, productAttrs) =>{
	var query = "insert into VD_PRODUCT(NAME, MRP, SP, CATEGORY_ID, Quantity, BRAND_ID, PRODUCT_SPECIFICATION, RETURN_POLICY, VERIFIED, IS_LIVE) "
" values ('" + productAttrs.productName +"', " + productAttrs.MRP + "," + productAttrs.SP + ", " + productAttrs.categoryID + ", " + productAttrs.quantity + ", " + productAttrs.brandID + ",'" + productAttrs.productSpecification + "'," + productAttrs.returnPolicy + "," + productAttrs.verified + "," + productAttrs.islive + ");SELECT SCOPE_IDENTITY() as primaryKey;";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
			if(recordsets['recordset'] != null) {
				callback(recordsets['recordset'][0]['primaryKey']);
			}
			else{
				callback(null);
			}
		}
		else{
			callback(null);
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

exports.addProductMappedToShop = (callback, productAttrs) =>{
	var query = "INSERT INTO VD_PRODUCT_DETAILS (PRODUCT_ID, BRAND_ID, SHOP_ID) VALUES (" + productAttrs.productid +"," + productAttrs.brandID +"," + productAttrs.shopID +");";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl in product mapped to shop server error" + err);
		}

	});
};

exports.addProductSpecifications = (callback, productID, key, value) =>{
	var query = "INSERT INTO VD_PRODCUT_ATTRIBUTES (PRODUCT_ID, ATTR_NAME, ATTR_VAL) VALUES (" + productID +",'"  +  key + "','" +  value + "');";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl in product specification error" + err);
		}

	});
};

exports.addProductPhoto = (callback, productID, photoAdress, isverified) =>{
	var query = "INSERT INTO VD_PRODUCT_PHOTO (PRODUCT_ID, PHOTO_ADRESS, VERIFIED) VALUES (" + productID +",'"  +  photoAdress + "'," +  isverified + ");";
	DBUtil.query(query, (err, recordsets) => {
		if(err == null) {
				callback("OK");
		}
		else{
			callback("Internal Server Error" + err);
			console.log("Internl in product image  error" + err);
		}

	});
};

exports.updateDefaultPhotoLink = (callback, productID, photoLink) =>{
	var query = "UPDATE VD_PRODUCT SET PHOTO_LINK = '"+ photoLink + "' WHERE PRODUCT_ID in (" + productID +")";
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
