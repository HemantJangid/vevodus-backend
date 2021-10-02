const multer = require('multer');

const uploads = multer({
    dest: "public/files"
})
const fileUpload = require('express-fileupload');

const express = require('express')

const app = express()
const port = 3000
var bodyParser = require("body-parser");


const shopDetail = require('./ShopController');
const user = require('./User');
const product = require('./Product');

var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: "AKIAV3KNKFMUZMWVRMCF", // Access key ID
    secretAccesskey: "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", // Secret access key
    region: "ap-south-1" //Region
})



const DBUtil = require('./connectionEstablish');
DBUtil.healthCheck((i) => {
    if (i != 'OK') {
        console.log("closing server. DB Connection Failed");
        server.close();
    }
});
app.use(fileUpload());


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

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


////////// USER API

app.post('/api/v1/user/validate', (req, res) => {
    var userDetails = {
        mobile: req.body.mobile,
        password: req.body.password
    }
    user.authenticate((i) => {
        res.send(i);
    }, userDetails);
});

///////// USER API END

app.post('/api/v1/product/add', (req, res) => {
    var userDetails = {
        mobile: req.body.mobile,
        password: req.body.password
    }
    product.addProducts((i) => {
        res.send(i);
    }, userDetails);
});

app.post('/upload', (req, res) => {
    console.log(req.files)
    const s3 = new AWS.S3();

    // Binary data base64
    const fileContent = Buffer.from(req.files.uploadFileName.data, 'binary');

    // Setting up S3 upload parameters
    const params = {
        Bucket: 'vevodusbucket',
        Key: "phase2.png", // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        res.send({
            "response_code": 200,
            "response_message": "Success",
            "response_data": data
        });
    });
})




var server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})