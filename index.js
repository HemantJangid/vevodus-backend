const express = require('express')
const app = express()
const port = 5432

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const sql = require('mssql')

function myFunc() {



  async () => {
    try {
      console.dir("s");
      // make sure that any items are correctly URL encoded in the connection string
      await sql.connect('Server=vevodus1.cvpftxp1yk7h.ap-south-1.rds.amazonaws.com,1433;Database=vevodus;User Id=admin;Password=Password;Encrypt=true')
      const result = await sql.query `select * from VD_STATES`
      console.dir(result)
    } catch (err) {
      console.dir(err);
      // ... error checks
    }

  }
}


app.listen(port, () => {
  myFunc();
  console.log(`Example app listening at http://localhost:${port}`)
})