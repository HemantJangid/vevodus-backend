const DBUtil = require('./DBUtil');

exports.getBroaderCategory = (callback) =>{
	var query = "select * from VD_CATEGORY";
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


exports.getAllBrands = (callback) =>{
	var query = "select * from VD_BRAND";
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


exports.addNewCategory = (callback, categoryAttrs) =>{
	let query = " INSERT INTO VD_CATEGORY (CATEGORY_NAME, SUB_CATEGORY, VERTICAL) VALUES ('" + categoryAttrs.categoryName+ "', '" + categoryAttrs.subCategory+ "' , '" + categoryAttrs.vertical+ "');  SELECT SCOPE_IDENTITY() as primaryKey;";
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

exports.addNewCategoryv2 = (categoryAttrs) =>{
	let query = " INSERT INTO VD_CATEGORY (CATEGORY_NAME, SUB_CATEGORY, VERTICAL) VALUES ('" + categoryAttrs.categoryName+ "', '" + categoryAttrs.subCategory+ "' , '" + categoryAttrs.vertical+ "');  SELECT SCOPE_IDENTITY() as primaryKey;";
	return query;
}