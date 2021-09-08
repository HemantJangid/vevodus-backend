const sql = require('mssql');
const multer = require('multer');
const uploads = multer({ dest: "public/files" })
const fileUpload = require('express-fileupload');
const express = require('express')
const app = express()
const port = 3000
var bodyParser  = require("body-parser");


const shopDetail = require('./util/ShopController');
const user = require('./util/User');
const brand = require('./util/Brand');
const product = require('./util/Product');
const categories = require('./util/Category');
const location = require('./util/Location');

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const DBUtil = require('./util/connectionEstablish');


var AWS = require('aws-sdk');
AWS.config.update(DBUtil.getAWSConf)

const s3Client = new AWS.S3(DBUtil.getAWSConf);



app.get('/', (req, res) => {
  res.send('Hello World!')
})



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

app.post('/api/v1/product/add',  async (req, res) =>{
    let shopID = req.body.shopid;
    if(shopID != null) {
        res.status(201);
        res.send("Missing Shop ID.");
    }
    else{
        try{
            let categoryID = req.body.categoryid;
            let brandID = req.body.brandid;
            if(categoryID == null) {
                let categoryAttrs = {};
                categoryAttrs['categoryName'] = req.body.categoryname;
                categoryAttrs['subCategory'] = req.body.subcategory;
                categoryAttrs['vertical'] = req.body.vertical;
                let addNewCategoryQuery = categories.addNewCategoryv2(categoryAttrs);
                await sql.connect(DBUtil.syncConfig)
                let categoriesResponse = await sql.query`${addNewCategoryQuery}`;
                categoryID = categoriesResponse['recordset'][0]['primaryKey'];
            }
            if(brandID == null) {
                let otherBrandName = req.body.brandname;
                let addNewBrandQuery = brand.addNewBrand2(otherBrandName);
                await sql.connect(DBUtil.syncConfig)
                let brandResponse = await sql.query`${addNewBrandQuery}`;
                brandID = recordsets['recordset'][0]['primaryKey'];
            }

            let productAttrs = {};
            productAttrs['productName'] = req.body.productname;
            productAttrs['MRP'] = req.body.mrp;
            productAttrs['SP'] = req.body.sp;
            productAttrs['categoryID'] = categoryID;
            productAttrs['quantity'] = req.body.quantity;
            productAttrs['brandID'] = brandID;
            productAttrs['productSpecification'] = req.body.productdesc;
            productAttrs['returnPolicy'] = req.body.returnpolicy;
            productAttrs['verified'] = 0;
            productAttrs['islive'] = 0;
            let addNewProdcutQuery = prodcut.addProductsV2(productAttrs);
            await sql.connect(DBUtil.syncConfig)
            let addNewProductResponse = await sql.query`${addNewProdcutQuery}`;
            let productID = categoriesResponse['recordset'][0]['primaryKey'];
            // Sending Response with now.
            res.send("Success with productID: " + addNewProductResponse);


            // async call
            let addProdcutMappedToShopQuery = prodcut.addProductMappedToShopV2({"productid" : productID , "brandID" : brandID, "shopID" : shopID});
            await sql.connect(DBUtil.syncConfig)
            let addNewProductMappedToShopResponse = await sql.query`${addProdcutMappedToShopQuery}`;
            console.log("Product Mapped to Shop :" + addNewProductMappedToShopResponse);


            let productRequrestAttrs = {};
            productRequrestAttrs['key'] = request.body.productspecificationkey;
            productRequrestAttrs['value'] = request.body.productspecificationvalue;
            if(request.body.productspecificationkey != null) {
                let arrayProductSpecificationKey = productRequrestAttrs['key'].split(',');
                let arrayProductSpecificationValue = productRequrestAttrs['value'].split(',');
                for(let k = 0 ; k <arrayProductSpecificationKey.length ; k ++) {
                    let addProductSpecificationsQuery = prodcut.addProductSpecificationsV2(productID, arrayProductSpecificationKey[k], arrayProductSpecificationValue[k]);
                    await sql.connect(DBUtil.syncConfig)
                    let addProductSpecificationsQueryResponse = await sql.query`${addProductSpecificationsQuery}`;
                    console.log("Product Specification Result :" + addProductSpecificationsQueryResponse);
                }
            }

            //photo upload path

            let photoLength = request.body.photolength;
            if(photoLength != undefined) {
                for(let photoIte = 0; photoIte < photolength ; photoIte++) {
                    let photoKeyReq = "photo" + photoIte;
                    let photoFileName = request.body[photoKeyReq].name + Math.floor(+new Date() / 1000);
                    const s3 = new AWS.S3();

                    // Binary data base64
                    let fileContent  = Buffer.from(req.files[photoKeyReq].data, 'binary');

                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'vevodusbucket',
                        Key: photoFileName, // File name you want to save as in S3
                        Body: fileContent,
                        ACL:'public-read'
                    };

                    console.log("Iterating AWS post request with post request : " + productID);
                    console.log("AWS FileName" + photoFileName);

                    // Uploading files to the bucket
                    s3Client.upload(params, function(err, data) {
                        if (err) {
                            console.log("Error in Uploading in AWS" + err);
                            throw err;
                        }
                        console.log("AWS Response code = " + data);

                        // Add New Photo Links
                        product.addProductPhoto((photoRes) =>{
                            console.log("Addded Photo Links Response" + photoRes);
                            if(photoIte == 0) {
                                // update the PRODUCT table with default link.
                                product.updateDefaultPhotoLink((defaultLinkRes)=>{
                                    console.log("Product ID with default link = " + productID);
                                    console.log("Updating default Link =" + defaultLinkRes);
                                }, productID,data.Location);
                            }
                        }, productID, data.Location, 0);
                       
                    });
                }

            }

        }
        catch(e) {
            res.status(201);
            res.send("Error in adding product" + e)

        }
    }
});

app.post('/api/v1/shop/signup', async (req, res) =>{
    let shopOwnerName = req.body.shopownername;
    let mobile = req.body.mobile;
    let emailAddress = req.body.address;
    let pincode = req.body.locationid;
    let shopName = req.body.shopname;
    let lang = req.body.lang;
    let lat = req.body.lat;
    let category = req.body.broadercategory;
    let GST = req.body.gst;
    let address = req.body.address;
    let nearbylandmark = req.body.nearbylandmark;
    let broaderCategory = req.body.broaderCategory;
    

    let reqJSON = {
        'shopOwnerName' : shopOwnerName,
        'mobile' : mobile,
        'emailAddress' : emailAddress,
        'pincode' : pincode,
        'shopName' : shopName,
        'lang' : lang,
        'lat' : lat,
        'category' : category,
        'GST' : GST,
        "address" : address,
        'broaderCategory' : broaderCategory,
        'nearBYAddress' : nearbylandmark,
        'role' : 'SELLER'
    };

    // iterate for missong
    for(var k in a){
        if(reqJSON[k] == undefined) {
            res.status(201);
            res.send("Missing Attributes = " + k);
            return;
        }
    }

    try {
        let locationIDQuery = location.getLocationID(pincode);
        await sql.connect(DBUtil.syncConfig)
        let locationIDResponse = await sql.query`${locationIDQuery}`;
        let locationID = locationIDResponse['recordset'][0]['LOCATION_ID'];

        // adding shop
        reqJSON['locationID'] = locationID;
        let addShopQuery = shopDetail.addNewShop(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addNewShopResponse = await sql.query`${addShopQuery}`;
        let shopID = addNewShopResponse['recordset'][0]['shopid'];
        reqJSON['shopID'] = shopID;

        // add new user
        let addNewUserQuery = user.addNewUser(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addNewUserQueryResponse = await sql.query`${addNewUserQuery}`;
        let userID = addNewUserQueryResponse['recordset'][0]['userid'];
        reqJSON['userID'] = userID;

        // add user Adress
        let addNewUserAddressQuery = user.addUserAddress(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserAddressResponse = await sql.query`${addNewUserAddressQuery}`;

        // add  User Role Mapped
        let addUserRoleMappedQuery = user.addUserRoleMapped(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserRoleMappedResponse = await sql.query`${addUserRoleMappedQuery}`;

        // add User Shop Mapped
        let addUserShopMappedQuery = shopDetail.addUserShopMapped(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserShopMappedResponse = await sql.query`${addUserShopMappedQuery}`;


                    //photo upload path

        let photoLength = request.body.photolength;
        if(photoLength != undefined) {
            for(let photoIte = 0; photoIte < photolength ; photoIte++) {
                let photoKeyReq = "photo" + photoIte;
                let photoFileName = request.body[photoKeyReq].name + Math.floor(+new Date() / 1000);
                const s3 = new AWS.S3();

                // Binary data base64
                let fileContent  = Buffer.from(req.files[photoKeyReq].data, 'binary');

                // Setting up S3 upload parameters
                const params = {
                    Bucket: 'vevodusbucket',
                    Key: photoFileName, // File name you want to save as in S3
                    Body: fileContent,
                    ACL:'public-read'
                };

                console.log("Iterating AWS post request with post request : " + productID);
                console.log("AWS FileName" + photoFileName);

                // Uploading files to the bucket
                s3Client.upload(params, function(err, data) {
                    if (err) {
                        console.log("Error in Uploading in AWS" + err);
                        throw err;
                    }
                    console.log("AWS Response code = " + data);

                    // Add New Photo Links
                    shopDetail.addShopPhoto((photoRes) =>{
                        console.log("Addded Photo Links Response" + photoRes);
                        if(photoIte == 0) {
                            // update the PRODUCT table with default link.
                            shopDetail.updateDefaultPhotoLink((defaultLinkRes)=>{
                                console.log("SHOP ID with default link = " + productID);
                                console.log("Updating default Link =" + defaultLinkRes);
                            }, reqJSON['shopID'],data.Location);
                        }
                    }, reqJSON['shopID'], data.Location, 0);
                   
                });
            }

        }
    }
    catch(e){
        res.status(201);
        res.send("Internal Server Error = " + e);
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












app.post('/upload1' , (req, res) =>{
    console.log(req.files)
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

 app.get('/synccall', async (req,res) =>{
    await sql.connect(dbConfig)
    let r = await sql.query`select * from VD_BRAND`;
    await res.send(r); 
    
    let result = DBUtil.syncDBQuery();
    console.log("response");
    console.log(result);
   // res.send(result);
})

 app.get('/synccall1', async (req,res) =>{
    await sql.connect(DBUtil.syncConfig)
    let r = await sql.query`select * from VD_BRAND`;
    console.log(r);
    res.send(r); 

    await sql.connect(DBUtil.syncConfig)
    r = await sql.query`select * from VD_BRAND`;
    console.log(r);
    // let result = DBUtil.syncDBQuery();
    console.log("response");
    //console.log(result);
   // res.send(result);
})


var server = app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`)
})