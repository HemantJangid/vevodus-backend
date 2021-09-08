const sql = require('mssql');
//const dbConfig = require('./dbconfig');
let connPoolPromise = null;

let DB_USER = process.env.DB_USER;
let DB_PWD = process.env.DB_PWD;
let dbName = process.env.DB_NAME;
let accessKeyId = process.env.ACCESS_KEY;
let secretAccesskey = process.env.SECRET_KEY;


const dbConfig = {
    user: DB_USER,
    password: DB_PWD,
    server: 'vevodus1.cvpftxp1yk7h.ap-south-1.rds.amazonaws.com',
    port: 1433,
    database: dbName,


    options: {
    encrypt: false,
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const AWSConf = {
        accessKeyId: accessKeyId, // Access key ID
        secretAccesskey: secretAccesskey, // Secret access key
        region: "ap-south-1" //Region
};

let umesh = null;
const getConnPoolPromise = () => {
  if (connPoolPromise) return connPoolPromise;

  connPoolPromise = new Promise((resolve, reject) => {
    const conn = new sql.ConnectionPool(dbConfig);

    conn.on('close', () => {
      connPoolPromise = null;
    });

    conn.connect().then(connPool => {
      return resolve(connPool);
    }).catch(err => {
      connPoolPromise = null;
      return reject(err);
    });
  });

  return connPoolPromise;
}

// Fetch data example using callback
exports.query = (sqlQuery, callback) => {
   getConnPoolPromise().then(connPool => {
    umesh = connPool;
    return connPool.request().query(sqlQuery);
  }).then(result => {
    callback(null, result);
  }).catch(err => {
    callback(err);
  });

};

async function query1()  {
  try {
      console.log("umesh jangi")
        // make sure that any items are correctly URL encoded in the connection string
        async () => {
          console.log("33")
          await sql.connect(dbConfig)
          let r = await sql.query`select * from VD_BRAND`;
          console.log(r) 
          return r;
       }
       // console.log(result)
        //return result;
        
    } catch (err) {
       console.log(err)
        // ... error checks
    }
 // return await umesh.request().query('select * from VD_BRAND');

};



// Fetch data example using callback
exports.syncDBQuery = query1;
exports.syncConfig = dbConfig;
exports.getAWSConf = AWSConf;