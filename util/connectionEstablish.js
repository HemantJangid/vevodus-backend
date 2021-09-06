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

// Fetch data example using callback
exports.syncDBQuery = () => {
  let result = DBUtil.syncDBQuery();//connPoolPromise.request().query('SELECT NOW()');
  // return result;

};
//}