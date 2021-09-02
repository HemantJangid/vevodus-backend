const DBUtil = require('./DBUtil');

//exports.healthCheck = () =>{

exports.healthCheck = (callback) =>{
	DBUtil.query('select * from VD_CONNECTION_DB', (err, recordsets) => {
	if(err == null) {
		if(recordsets['recordset'][0]['NAME'] == 'OK'){
			console.log("DB Connection Successfully");
			callback("OK");
		}
		else {
			callback("FAIL");
			console.log("DB Connection Failed" + recordsets);	
		}
	}
	else{
		callback("FAIL");
		console.log("DB Connection Failed" + err);
	}

});
}
//}