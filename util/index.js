const express = require('express')
const app = express()
const port = 3000

const shopDetail = require('./ShopController');
const DBUtil = require('./connectionEstablish');
DBUtil.healthCheck((i) => {
    if (i != 'OK') {
        console.log("closing server. DB Connection Failed");
        server.close();
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/api/v1/shop/getdetails', (req, res) => {
    var userID = req.query['userid'];
    if (userID == null) {
        res.send("Missing user id.");
    } else {
        shopDetail.getShopDetails((i) => {
            res.send(i);
        }, userID)

    }
});


var server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})