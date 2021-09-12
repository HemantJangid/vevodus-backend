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

exports.addProductsV2 = (productAttrs) =>{
	var query = "insert into VD_PRODUCT(NAME, MRP, SP, CATEGORY_ID, Quantity, BRAND_ID, PRODUCT_SPECIFICATION, RETURN_POLICY, VERIFIED, IS_LIVE)  values ('" + productAttrs.productName +"', " + productAttrs.MRP + "," + productAttrs.SP + ", " + productAttrs.categoryID + ", " + productAttrs.quantity + ", " + productAttrs.brandID + ",'" + productAttrs.productSpecification + "'," + productAttrs.returnPolicy + "," + productAttrs.verified + "," + productAttrs.islive + ");SELECT SCOPE_IDENTITY() as primaryKey;";
	console.log(query);
	return query;
}


exports.getProducts = (callback, shopID) =>{
	var query = "select a.PRODUCT_ID as productId, NAME as name, a.MRP as mrp, a.SP as sp , a.CATEGORY_ID as categoryId, a.Quantity as quantity,  a.BRAND_ID as brandId,  a.PRODUCT_SPECIFICATION as productSpecification, a.RETURN_POLICY as returnPolicy,  a.VERIFIED as verified, a.IS_LIVE as isLive, a.PHOTO_LINK as photoLink, b.CATEGORY_NAME as categoryName, b.SUB_CATEGORY as subCategory, b.VERTICAL as vertical from VD_PRODUCT as a inner join VD_CATEGORY as b on a.PRODUCT_ID  in (SELECT PRODUCT_ID FROM VD_PRODUCT_DETAILS where shop_id =" + shopID+") and a.CATEGORY_ID = b.category_id ";
	//var query = "select PRODUCT_ID as productId, NAME as name, MRP as mrp, SP as sp, CATEGORY_ID as categoryId, Quantity as quantity,  BRAND_ID as brandId, PRODUCT_SPECIFICATION as productSpecification, RETURN_POLICY as returnPolicy, VERIFIED as verified, IS_LIVE as isLive, PHOTO_LINK as photoLink from VD_PRODUCT where PRODUCT_ID in (SELECT PRODUCT_ID FROM VD_PRODUCT_DETAILS where shop_id = " + shopID + ")";
		if(shopID == -1 || shopID == '-1') {
			query = "select a.PRODUCT_ID as productId, NAME as name, a.MRP as mrp, a.SP as sp , a.CATEGORY_ID as categoryId, a.Quantity as quantity,  a.BRAND_ID as brandId,  a.PRODUCT_SPECIFICATION as productSpecification, a.RETURN_POLICY as returnPolicy,  a.VERIFIED as verified, a.IS_LIVE as isLive, a.PHOTO_LINK as photoLink, b.CATEGORY_NAME as categoryName, b.SUB_CATEGORY as subCategory, b.VERTICAL as vertical from VD_PRODUCT as a inner join VD_CATEGORY as b on a.CATEGORY_ID = b.category_id ";

		}
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

exports.changeQuantity = (callback, productAttr) =>{
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
	var query = "select PHOTO_ID as photoId, PRODUCT_ID as productId, PHOTO_ADRESS as photoAddress, VERIFIED as verified from VD_PRODUCT_PHOTO where product_id = " + productid;
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
	var query = "select PRODUCT_ID as productId, ATTR_NAME as attrName, ATTR_VAL  as attrVal from VD_PRODCUT_ATTRIBUTES where product_id =  " + productid;
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

exports.addProductMappedToShopV2 = (productAttrs) =>{
	var query = "INSERT INTO VD_PRODUCT_DETAILS (PRODUCT_ID, BRAND_ID, SHOP_ID) VALUES (" + productAttrs.productid +"," + productAttrs.brandID +"," + productAttrs.shopID +");";
	return query;
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

exports.addProductSpecificationsV2 = (productID, key, value) =>{
	var query = "INSERT INTO VD_PRODCUT_ATTRIBUTES (PRODUCT_ID, ATTR_NAME, ATTR_VAL) VALUES (" + productID +",'"  +  key + "','" +  value + "');";
	return query;
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


exports.getCheckoutHistory = (shopID) =>{
	var query = "select a.CHECKOUT_ID as checkout, a.USER_ID as userId, a.PRODUCT_ID as productId, a.status as status , bb.name as name, bb.mrp as mrp, bb.sp as sp, bb.quantity as quantity, bb.brandId as brandId, bb.productSpecification as productSpecification, bb.returnPolicy as returnPolicy, bb.verified as verified, bb.isLive as isLive, bb.photoLink as photoLink from VD_USER_CHECKOUT as a inner join ( select a.PRODUCT_ID as productId, NAME as name, a.MRP as mrp, a.SP as sp , a.CATEGORY_ID as categoryId, a.Quantity as quantity,  a.BRAND_ID as brandId, a.PRODUCT_SPECIFICATION as productSpecification, a.RETURN_POLICY as returnPolicy, a.VERIFIED as verified, a.IS_LIVE as isLive, a.PHOTO_LINK as photoLink, b.CATEGORY_NAME as categoryName,  b.SUB_CATEGORY as subCategory, b.VERTICAL as vertical from VD_PRODUCT as a inner join VD_CATEGORY as b on a.PRODUCT_ID  in  (SELECT PRODUCT_ID FROM VD_PRODUCT_DETAILS where shop_id =" +  shopID+") and a.CATEGORY_ID = b.category_id ) as bb on a.PRODUCT_ID = bb.productId";
	return query;
};

