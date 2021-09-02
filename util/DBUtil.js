const sql = require('mssql');
//const dbConfig = require('./dbconfig');
let connPoolPromise = null;
const dbConfig = {
    user: 'admin',
    password: 'Password',
    server: 'vevodus1.cvpftxp1yk7h.ap-south-1.rds.amazonaws.com',
    port: 1433,
    database: 'vevodus',


    options: {
    encrypt: false,
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

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
    return connPool.request().query(sqlQuery);
  }).then(result => {
    callback(null, result);
  }).catch(err => {
    callback(err);
  });

};