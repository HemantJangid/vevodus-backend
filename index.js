const multer = require('multer');
const uploads = multer({ dest: "public/files" })
const fileUpload = require('express-fileupload');
const express = require('express')
const app = express()
const port = 3000
var bodyParser  = require("body-parser");


const shopDetail = require('./util/ShopController');
const user = require('./util/User');
const product = require('./util/Product');
const categories = require('./util/Category');

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



var AWS = require('aws-sdk');
AWS.config.update({
        accessKeyId: "AKIAV3KNKFMUZMWVRMCF", // Access key ID
        secretAccesskey: "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", // Secret access key
        region: "ap-south-1" //Region
})

const s3Client = new AWS.S3({
    accessKeyId: 'AKIAV3KNKFMUZMWVRMCF',
    secretAccessKey: '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',
    region :'ap-south-1'
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})


const DBUtil = require('./util/connectionEstablish');
DBUtil.healthCheck((i)=>{
        if(i != 'OK') {
            console.log("closing server. DB Connection Failed");
            server.close();
        }
    }
);


app.get('/api/v1/shop/getdetails', (req, res) =>{
    var userID = req.query['userid'];
    if(userID == null) {
        res.send("Missing user id.");
    }
    else {
        shopDetail.getShopDetails((i) =>{
            res.send(i);
        }, userID)

    }
});

app.get('/api/v1/getAllShops', (req, res) =>{
    shopDetail.getAllShops((i) =>{
            res.send(i);
    });
})

app.post('/api/v1/shop/statusChanged', (req, res) => {
    var shopAttrs = {
        shopIDs : req.body.shopids,
        isVerified : req.body.isverified,
    }
    shopDetail.changeStatusShop((i) =>{
            res.send(i);
    }, shopAttrs);
});

app.get('/api/v1/shop/getPhotosLink', (req, res) =>{
    let productid = req.query.shopid;
    shopDetail.getPhotosLink((i) =>{
        res.send(i);
    }, productid);
});

app.get('/api/v1/product/getProducts' , (req,res) =>{
    var userID = req.query['shopid'];
    if(userID == null) {
        res.send("Missing shopid id.");
    }
    else {
        product.getProducts((i) =>{
            res.send(i);
        }, userID)

    }
})


app.post('/api/v1/product/statusChanged', (req, res) => {
    var shopAttrs = {
        productIDs : req.body.productids,
        isVerified : req.body.isverified,
    }
    product.changeStatusProduct((i) =>{
            res.send(i);
    }, shopAttrs);
});

app.post('/api/v1/product/liveStatusChanged', (req, res) => {
    var shopAttrs = {
        productIDs : req.body.productids,
        isVerified : req.body.isverified,
    }
    product.changeLiveStatusProduct((i) =>{
            res.send(i);
    }, shopAttrs);
});

////////// USER API

app.post('/api/v1/user/validate', (req, res) =>{
    var userDetails = {
        mobile : req.body.mobile,
        password : req.body.password,
        app : req.body.app
    }
    user.authenticate((i) => {
        console.log(i)
        if(i != 'ERROR') {
            let length = i.length;
            console.log("length" + i.length);
            if(length == 1) {
                    let userIDResp = i[0]['USER_ID'];
                    console.log(userIDResp);
                    if(userDetails.app == 'SELLER') {
                        shopDetail.getShopDetails((ii) =>{
                                let responseConsturct = {};
                                responseConsturct['userDetails'] = i;
                                responseConsturct['shopDetail'] = ii;
                                res.status(200);
                                res.send(responseConsturct);
                        }, userIDResp)

                    }
                    else {
                        res.status(200);
                        res.send(i);
                    }

            }
            else {
                res.status(201);
                res.send("UnAuthenticate");
            }

        }
        else {
            res.status(201);
            res.send("UnAuthenticate");
        }
    }, userDetails);
});

///////// USER API END

app.get('/api/v1/product/getPhotosLink', (req, res) =>{
    let productid = req.query.productid;
    product.getPhotosLink((i) =>{
        res.send(i);
    }, productid);
});


app.get('/api/v1/product/getProductAttrs', (req, res) =>{
    let productid = req.query.productid;
    product.getProductAttrs((i) =>{
        res.send(i);
    }, productid);
});

app.post('/api/v1/product/add', (req, res) =>{
    let shopID = req.body.shopid;
    if(shopID != null) {
        let categoryID = req.body.categoryid;
        let brandID = req.body.brandid;
        if(brandID == null) {
            // create new brand ID.


        }
        else if(categoryID == null) {
            // create new category ID.
        }

    }
    else{
        res.status(201);
        res.send("Missing Shop ID.");
    }
});

app.post('/api/v1/product/changeQuantity', (req, res) =>{
    var productAttrs = {
        quantity : req.body.quantity,
        productid : req.body.productid
    }
    product.changeQuantity((i) =>{
        res.send(i);
    }, productAttrs);
});



app.get('/api/v1/getAllCatogriesaAndBrands', (req, res) =>{
    categories.getBroaderCategory((i) =>{
        categories.getAllBrands((ii) =>{
            let response = {};
            response['categories'] = i;
            response['brands'] = ii;
            res.send(response);
        });
        
    });
});
















app.post('/upload' , (req, res) =>{
    console.log(req.files)
    const s3 = new AWS.S3();

    // Binary data base64
    const fileContent  = Buffer.from(req.files.uploadFileName.data, 'binary');

    // Setting up S3 upload parameters
    const params = {
        Bucket: 'vevodusbucket',
        Key: "phase2.png", // File name you want to save as in S3
        Body: fileContent,
        ACL:'public-read'
    };

    // Uploading files to the bucket
    s3Client.upload(params, function(err, data) {
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