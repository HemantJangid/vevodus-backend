const sql = require('mssql');
const multer = require('multer');
const uploads = multer({ dest: "public/files" })
const fileUpload = require('express-fileupload');
const express = require('express')
const app = express()
const port = 3000
var bodyParser  = require("body-parser");
//require('dotenv').config();

const shopDetail = require('./util/ShopController');
const user = require('./util/User');
const brand = require('./util/Brand');
const product = require('./util/Product');
const categories = require('./util/Category');
const location = require('./util/Location');
const userCheckout = require('./util/UserCheckout');

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const DBUtil = require('./util/connectionEstablish');


var AWS = require('aws-sdk');
AWS.config.update(DBUtil.getAWSConf)

const s3Client = new AWS.S3(DBUtil.getAWSConf);



app.get('/', (req, res) => {
    //console.log(limit);
  res.send('Hello World')
})

app.get('/api/v', (req, res)=>{
    res.sendfile('connect.html');
  })


DBUtil.healthCheck((i)=>{
        if(i != 'OK') {
            console.log("closing server. DB Connection Failed");
            server.close();
        }
    }
);


app.get('/api/v1/shop/getDetails', (req, res) =>{
    var userID = req.query['userId'];
    if(userID == null) {
        res.status(201)
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
    }, req.query['verified']);
})

app.post('/api/v1/shop/statusChanged', (req, res) => {
    var shopAttrs = {
        shopIDs : req.body.shopIds,
        isVerified : req.body.isVerified,
    }
    shopDetail.changeStatusShop((i) =>{
            res.send(i);
    }, shopAttrs);
});

app.get('/api/v1/shop/getPhotosLink', (req, res) =>{
    let productid = req.query.shopId;
    shopDetail.getPhotosLink((i) =>{
        res.send(i);
    }, productid);
});

app.get('/api/v1/product/getProducts' , (req,res) =>{
    var userID = req.query['shopId'];
    var isLive = req.query['isLive'];
    if(userID == null) {
        res.status(201);
        res.send("Missing shopid id.");
    }
    else {
        product.getProducts((i) =>{
            shopDetail.getShopDesc((ii) =>{
                let responseConsturct = {};
                responseConsturct['products'] = i;
                responseConsturct['shop'] = ii;
                res.send(responseConsturct);

            }, userID);
            //res.send(i);
        }, userID, isLive, req.query['verified'])

    }
})


app.post('/api/v1/product/statusChanged', (req, res) => {
    var shopAttrs = {
        productids : req.body.productIds,
        isverified : req.body.isVerified,
    }
    product.changeStatusProduct((i) =>{
            res.send(i);
    }, shopAttrs);
});

app.post('/api/v1/product/liveStatusChanged', (req, res) => {
    var shopAttrs = {
        productids : req.body.productIds,
        isverified : req.body.isLive,
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
                    let userIDResp = i[0]['userId'];
                    console.log(userIDResp);
                    if(userDetails.app == 'SELLER') {
                        shopDetail.getShopDetails((ii) =>{
                                let responseConsturct = {};
                                responseConsturct['userDetail'] = i;
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
    let productid = req.query.productId;
    product.getPhotosLink((i) =>{
        res.send(i);
    }, productid);
});


app.get('/api/v1/product/getProductAttrs', (req, res) =>{
    let productid = req.query.productId;
    product.getProductAttrs((i) =>{
        res.send(i);
    }, productid);
});

app.post('/api/v1/product/update',  async (req, res) =>{
    let productId = req.body.productId;

    let attributeMissing = {};
    
    if((req.body.categoryId ==  undefined || req.body.categoryId == -1) && req.body.categoryName == undefined) {
        res.status(201);
        res.send("Missing cateGoryName Parameter.");
        return;
    }
    

    attributeMissing['productName'] =req.body.productName;
    attributeMissing['MRP'] =req.body.mrp;
    attributeMissing['SP'] =req.body.sp;
    attributeMissing['quantity'] =req.body.quantity;
    attributeMissing['productSpecification'] =req.body.productSpecification;
    attributeMissing['returnPolicy'] =req.body.returnPolicy;

    if(attributeMissing['returnPolicy'] == undefined){
        attributeMissing['returnPolicy'] = 1;
    }

        // iterate for missong
    for(var k in attributeMissing){
        if(attributeMissing[k] == undefined) {
            res.status(201);
            res.send("Missing Attributes = " + k);
            return;
        }
    }

    if(productId == null) {
        res.status(201);
        res.send("Missing productId ID.");
    }
    else{
        //try{
            let categoryID = req.body.categoryId;
            let brandID = 1;
            if(categoryID == null) {
                let categoryAttrs = {};
                categoryAttrs['categoryName'] = req.body.categoryName;
                categoryAttrs['subCategory'] = req.body.subCategory ;
                categoryAttrs['vertical'] = req.body.vertical;
                if(req.body.subCategory == undefined) {
                    categoryAttrs['subCategory'] = 'empty';
                }
                if(req.body.vertical == undefined) {
                    categoryAttrs['vertical'] = 'empty';
                }
                
                let addNewCategoryQuery = categories.addNewCategoryv2(categoryAttrs);
                await sql.connect(DBUtil.syncConfig)
                let categoriesResponse = await sql.query(addNewCategoryQuery);
                categoryID = categoriesResponse['recordset'][0]['primaryKey'];
            }
            if(brandID == null) {
                let otherBrandName = req.body.brandName;
                let addNewBrandQuery = brand.addNewBrand2(otherBrandName);
                await sql.connect(DBUtil.syncConfig)
                let brandResponse = await sql.query(addNewBrandQuery);
                brandID = recordsets['recordset'][0]['primaryKey'];
            }

            let productAttrs = {};
            productAttrs['productId'] = productId;
            productAttrs['productName'] = req.body.productName;
            productAttrs['MRP'] = req.body.mrp;
            productAttrs['SP'] = req.body.sp;
            productAttrs['categoryID'] = categoryID;
            productAttrs['quantity'] = req.body.quantity;
            productAttrs['brandID'] = brandID;
            productAttrs['productSpecification'] = req.body.productSpecification;
            productAttrs['returnPolicy'] = attributeMissing['returnPolicy'];
            productAttrs['verified'] = 1;
            productAttrs['islive'] = 1;
            let addNewProdcutQuery = product.updateProductsV2(productAttrs);
            await sql.connect(DBUtil.syncConfig)
            let addNewProductResponse = await sql.query(addNewProdcutQuery);
            let productID = productId;
            // Sending Response with now.
            //res.send("Success with productID: " + addNewProductResponse);




            res.send("OK");

        //}
        //catch(e) {
            //res.status(201);
          //  res.send("Error in adding product" + e)

        //}
    }
});

app.post('/api/v1/product/add',  async (req, res) =>{
    let shopID = req.body.shopId;

    let attributeMissing = {};
    
    if((req.body.categoryId ==  undefined || req.body.categoryId == -1) && req.body.categoryName == undefined) {
        res.status(201);
        res.send("Missing cateGoryName Parameter.");
        return;
    }
    

    attributeMissing['productName'] =req.body.productName;
    attributeMissing['MRP'] =req.body.mrp;
    attributeMissing['SP'] =req.body.sp;
    attributeMissing['quantity'] =req.body.quantity;
    attributeMissing['productSpecification'] =req.body.productSpecification;
    attributeMissing['returnPolicy'] =req.body.returnPolicy;

    if(attributeMissing['returnPolicy'] == undefined){
        attributeMissing['returnPolicy'] = 1;
    }

        // iterate for missong
    for(var k in attributeMissing){
        if(attributeMissing[k] == undefined) {
            res.status(201);
            res.send("Missing Attributes = " + k);
            return;
        }
    }







    if(shopID == null) {
        res.status(201);
        res.send("Missing Shop ID.");
    }
    else{
        try{
            let categoryID = req.body.categoryId;
            let brandID = 1;
            if(categoryID == null) {
                let categoryAttrs = {};
                categoryAttrs['categoryName'] = req.body.categoryName;
                categoryAttrs['subCategory'] = req.body.subCategory ;
                categoryAttrs['vertical'] = req.body.vertical;
                if(req.body.subCategory == undefined) {
                    categoryAttrs['subCategory'] = 'empty';
                }
                if(req.body.vertical == undefined) {
                    categoryAttrs['vertical'] = 'empty';
                }
                
                let addNewCategoryQuery = categories.addNewCategoryv2(categoryAttrs);
                await sql.connect(DBUtil.syncConfig)
                let categoriesResponse = await sql.query(addNewCategoryQuery);
                categoryID = categoriesResponse['recordset'][0]['primaryKey'];
            }
            if(brandID == null) {
                let otherBrandName = req.body.brandName;
                let addNewBrandQuery = brand.addNewBrand2(otherBrandName);
                await sql.connect(DBUtil.syncConfig)
                let brandResponse = await sql.query(addNewBrandQuery);
                brandID = recordsets['recordset'][0]['primaryKey'];
            }

            let productAttrs = {};
            productAttrs['productName'] = req.body.productName;
            productAttrs['MRP'] = req.body.mrp;
            productAttrs['SP'] = req.body.sp;
            productAttrs['categoryID'] = categoryID;
            productAttrs['quantity'] = req.body.quantity;
            productAttrs['brandID'] = brandID;
            productAttrs['productSpecification'] = req.body.productSpecification;
            productAttrs['returnPolicy'] = attributeMissing['returnPolicy'];
            productAttrs['verified'] = 1;
            productAttrs['islive'] = 1;
            let addNewProdcutQuery = product.addProductsV2(productAttrs);
            await sql.connect(DBUtil.syncConfig)
            let addNewProductResponse = await sql.query(addNewProdcutQuery);
            let productID = addNewProductResponse['recordset'][0]['primaryKey'];
            // Sending Response with now.
            //res.send("Success with productID: " + addNewProductResponse);


            // async call
            let addProdcutMappedToShopQuery = product.addProductMappedToShopV2({"productid" : productID , "brandID" : brandID, "shopID" : shopID});
            await sql.connect(DBUtil.syncConfig)
            let addNewProductMappedToShopResponse = await sql.query(addProdcutMappedToShopQuery);
            console.log("Product Mapped to Shop :" + addNewProductMappedToShopResponse);


            let productRequrestAttrs = {};
            productRequrestAttrs['key'] = req.body.productSpecificationkey;
            productRequrestAttrs['value'] = req.body.productSpecificationvalue;
            if(req.body.productSpecificationkey != null) {
                let arrayProductSpecificationKey = productRequrestAttrs['key'].split(',');
                let arrayProductSpecificationValue = productRequrestAttrs['value'].split(',');
                for(let k = 0 ; k <arrayProductSpecificationKey.length ; k ++) {
                    let addProductSpecificationsQuery = product.addProductSpecificationsV2(productID, arrayProductSpecificationKey[k], arrayProductSpecificationValue[k]);
                    await sql.connect(DBUtil.syncConfig)
                    let addProductSpecificationsQueryResponse = await sql.query(addProductSpecificationsQuery);
                    console.log("Product Specification Result :" + addProductSpecificationsQueryResponse);
                }
            }

            res.send("OK");

            //photo upload path

            let photoLength = req.body.photoLength;
            if(photoLength != undefined) {
                var files = getFilesObjects(req.files, 'photos');

                for(let photoIte = 0; photoIte < files.length ; photoIte++) {
                    let photoKeyReq = files[photoIte];
                    let photoFileName = Math.floor(+new Date() / 1000) + files[photoIte].name ;
                    const s3 = new AWS.S3();

                    // Binary data base64
                    let fileContent  = Buffer.from(files[photoIte].data, 'binary');

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
            else{
                let photosLinkParam = req.body.photos;
                if(photosLinkParam != undefined && photoLength > 0) {
                    for(let gg = 0 ; gg < photoLength ; gg++){
                        let linkToUpload = photosLinkParam[gg];
                        if(photoLength == 1) {
                            linkToUpload = photosLinkParam;
                        }
                        // Add New Photo Links
                        product.addProductPhoto((photoRes) =>{
                            console.log("Addded Photo Links Response" + photoRes);
                            if(gg == 0) {
                                // update the PRODUCT table with default link.
                                product.updateDefaultPhotoLink((defaultLinkRes)=>{
                                    console.log("Product ID with default link = " + productID);
                                    console.log("Updating default Link =" + defaultLinkRes);
                                }, productID,linkToUpload);
                            }
                        }, productID, linkToUpload, 0);
                    }
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
    let shopOwnerName = req.body.shopOwnerName;
    let mobile = req.body.mobile;
    let emailAddress = req.body.emailAddress;
    let pincode = req.body.pincode;
    let shopName = req.body.shopName;
    let lang = req.body.lang;
    let lat = req.body.lat;
    let category = req.body.broaderCategory;
    let GST = req.body.gst;
    let address = req.body.address;
    let broaderCategory = req.body.broaderCategory;
    let password = req.body.password;
    

    let reqJSON = {
        'shopOwnerName' : shopOwnerName,
        'mobile' : mobile,
        'emailAddress' : emailAddress,
        'shopName' : shopName,
        'lang' : lang,
        'lat' : lat,
        'category' : category,
        'GST' : GST,
        "address" : address,
        'broaderCategory' : broaderCategory,
        'role' : 'SELLER',
        'nearBYAddress' : 'dummy',
        'locationID' : 3,
        'password' : password
    };

    // iterate for missong
    for(var k in reqJSON){
        if(reqJSON[k] == undefined) {
            res.status(201);
            res.send("Missing Attributes = " + k);
            return;
        }
    }



    try {

        // check for mobile as primary kkey
        let adduniqueUserQuery = user.uniqueUser(mobile);
        await sql.connect(DBUtil.syncConfig)
        let adduniqueUserQueryResponse = await sql.query(adduniqueUserQuery);
        if(adduniqueUserQueryResponse['recordset'].length != 0){
            res.status(201);
            res.send("User with this Mobile Number Already Registered.");
            return;
        }
    


        let addShopQuery = shopDetail.addNewShop(reqJSON);
        console.log(addShopQuery);
        await sql.connect(DBUtil.syncConfig)
        let addNewShopResponse = await sql.query(addShopQuery);
        let shopID = addNewShopResponse['recordset'][0]['shopid'];
        reqJSON['shopID'] = shopID;

        // add new user
        let addNewUserQuery = user.addNewUser(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addNewUserQueryResponse = await sql.query(addNewUserQuery);
        let userID = addNewUserQueryResponse['recordset'][0]['userid'];
        reqJSON['userID'] = userID;

        // add password
        let addNewUserPasswordQuery = user.addNewUserPassword(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addNewUserPasswordQueryResponse = await sql.query(addNewUserPasswordQuery);
        


        // add user Adress
        let addNewUserAddressQuery = user.addUserAddress(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserAddressResponse = await sql.query(addNewUserAddressQuery);

        // add  User Role Mapped
        let addUserRoleMappedQuery = user.addUserRoleMapped(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserRoleMappedResponse = await sql.query(addUserRoleMappedQuery);

        // add User Shop Mapped
        let addUserShopMappedQuery = shopDetail.addUserShopMapped(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserShopMappedResponse = await sql.query(addUserShopMappedQuery);

        res.send("OK");
        //photo upload path

        let photoLength = req.body.photoLength;
        if(photoLength != undefined) {
            if(req.files != undefined){

                var files = getFilesObjects(req.files, 'photos');


                for(let photoIte = 0; photoIte < files.length ; photoIte++) {
                    let photoKeyReq = files[photoIte];
                    let photoFileName = Math.floor(+new Date() / 1000) + files[photoIte].name;
                    const s3 = new AWS.S3();

                    // Binary data base64
                    let fileContent  = Buffer.from(files[photoIte].data, 'binary');

                    // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'vevodusbucket',
                        Key: photoFileName, // File name you want to save as in S3
                        Body: fileContent,
                        ACL:'public-read'
                    };

                    console.log("Iterating AWS post request with post request : ");
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
                                    console.log("SHOP ID with default link = " + shopID);
                                    console.log("Updating default Link =" + defaultLinkRes);
                                }, reqJSON['shopID'],data.Location);
                            }
                        }, reqJSON['shopID'], data.Location, 0);
                       
                    });

                }
            }
            else{
                let photosLinkParam = req.body.photos;
                if(photosLinkParam != undefined && photoLength > 0) {
                    for(let gg = 0 ; gg < photoLength ; gg++){
                        let linkToUpload = photosLinkParam[gg];
                        if(photoLength == 1) {
                            linkToUpload = photosLinkParam;
                        }
                        // Add New Photo Links
                        shopDetail.addShopPhoto((photoRes) =>{
                            console.log("Addded Photo Links Response" + photoRes);
                            if(gg == 0) {
                                // update the PRODUCT table with default link.
                                shopDetail.updateDefaultPhotoLink((defaultLinkRes)=>{
                                    console.log("Product ID with default link = " + shopID);
                                    console.log("Updating default Link =" + defaultLinkRes);
                                }, shopID,linkToUpload);
                            }
                        }, shopID, linkToUpload, 0);
                    }
                }
            }
        }
    }
    catch(e){
        console.log("Internal Server Error = " + e);
        res.status(201);
        res.send("Internal Server Error = " + e);
    }

});

app.post('/api/v1/user/signup', async (req, res) =>{
    let shopOwnerName = req.body.name;
    let mobile = req.body.mobile;
    let emailAddress = req.body.emailAddress;
    let address = req.body.address;
    let password = req.body.password;
    

    let reqJSON = {
        'shopOwnerName' : shopOwnerName,
        'mobile' : mobile,
        'emailAddress' : emailAddress,
        "address" : address,
        'role' : 'BUYER',
        'nearBYAddress' : 'dummy',
        'locationID' : 3,
        'password' : password
    };

    // iterate for missong
    for(var k in reqJSON){
        if(reqJSON[k] == undefined) {
            res.status(201);
            res.send("Missing Attributes = " + k);
            return;
        }
    }

    try {

         // check for mobile as primary kkey
        let adduniqueUserQuery = user.uniqueUser(mobile);
        await sql.connect(DBUtil.syncConfig)
        let adduniqueUserQueryResponse = await sql.query(adduniqueUserQuery);
        if(adduniqueUserQueryResponse['recordset'].length != 0){
            res.status(201);
            res.send("User with this Mobile Number Already Registered.");
            return;
        }

        // add new user
        let addNewUserQuery = user.addNewUser(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addNewUserQueryResponse = await sql.query(addNewUserQuery);
        let userID = addNewUserQueryResponse['recordset'][0]['userid'];
        reqJSON['userID'] = userID;

        // add password
        let addNewUserPasswordQuery = user.addNewUserPassword(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addNewUserPasswordQueryResponse = await sql.query(addNewUserPasswordQuery);
        


        // add user Adress
        let addNewUserAddressQuery = user.addUserAddress(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserAddressResponse = await sql.query(addNewUserAddressQuery);

        // add  User Role Mapped
        let addUserRoleMappedQuery = user.addUserRoleMapped(reqJSON);
        await sql.connect(DBUtil.syncConfig)
        let addUserRoleMappedResponse = await sql.query(addUserRoleMappedQuery);

       

        res.send("OK");
        //photo upload path

        let photoLength = req.body.photoLength;
        if(photoLength != undefined) {
            if(req.files != undefined){
                
                var files = getFilesObjects(req.files, 'photos');


                for(let photoIte = 0; photoIte < files.length ; photoIte++) {
                    let photoKeyReq = files[photoIte];
                    let photoFileName = Math.floor(+new Date() / 1000) + files[photoIte].name
                     const s3 = new AWS.S3();
                    let fileContent  = Buffer.from(files[photoIte].data, 'binary');
                    console.log(photoFileName);
                    console.log(fileContent);

                     // Setting up S3 upload parameters
                    const params = {
                        Bucket: 'vevodusbucket',
                        Key: photoFileName, // File name you want to save as in S3
                        Body: fileContent,
                        ACL:'public-read'
                    };

                    console.log("Iterating AWS post request with post request : ");
                    console.log("AWS FileName" + photoFileName);

                    // Uploading files to the bucket
                    s3Client.upload(params, function(err, data) {
                        if (err) {
                            console.log("Error in Uploading in AWS" + err);
                            throw err;
                        }
                        console.log("AWS Response code = " + data);

                        // Add New Photo Links
                        user.addUserPhoto((photoRes) =>{
                            console.log("Addded Photo Links Response" + photoRes);
                        }, reqJSON['userID'], data.Location, 0);
                       
                    });
                }
            }
            else{
                let photosLinkParam = req.body.photos;
                if(photosLinkParam != undefined && photoLength > 0) {
                    for(let gg = 0 ; gg < photoLength ; gg++){
                        let linkToUpload = photosLinkParam[gg];
                        if(photoLength == 1) {
                            linkToUpload = photosLinkParam;
                        }
                        // Add New Photo Links
                        user.addUserPhoto((photoRes) =>{
                            console.log("Addded Photo Links Response" + photoRes);
                        }, reqJSON['userID'], linkToUpload, 0);
                    }
                }
            }
        }
    }
    catch(e){
        console.log("Internal Server Error = " + e);
        res.status(201);
        res.send("Internal Server Error = " + e);
    }

});

app.post('/api/v1/product/changeQuantity', (req, res) =>{
    var productAttrs = {
        quantity : req.body.quantity,
        productid : req.body.productId
    }
    product.changeQuantity((i) =>{
        res.send(i);
    }, productAttrs);
});



app.get('/api/v1/getAllCategoriesAndBrands', (req, res) =>{
    categories.getBroaderCategory((i) =>{
        categories.getAllBrands((ii) =>{
            let response = {};
            response['categories'] = i;
            response['brands'] = ii;
            res.send(response);
        });
        
    });
});

app.get('/api/v1/pincode/getAllPinCodes', (req, res) =>{
    location.getAllPinCodes((i)=>{
        res.send(i);
    })
});


app.post('/api/v1/product/checkout', (req, res) =>{
   
    let userID = req.body.userId;
    let productId = req.body.productId;
    let quantity = req.body.quantity;
    if(userID != undefined && productId != undefined && quantity != undefined) {
        user.addCheckout((ii)=>{
            res.send(ii);
        }, userID , productId, quantity);
    }
    else{
        res.status(201);
        res.send("Missing userId and productId , quantity parameters");
    }
});


app.post('/api/v1/checkout/statusChanged', (req, res) =>{
    
    let checkout = req.body.checkoutId;
    let status = req.body.status;
    if(checkout != undefined && status != undefined) {
        if(status == 'APPROVE') {
            status ='A';
        }
        else if(status == 'DECLINE'){
            status = 'D'
        }
        else if(status == 'COMPLETE'){
            status = 'C'
        }
        else if(status == 'C_DECLINE'){
            status = 'X'
        }
        else{
            status = 'N';
        }
        user.changeStatusCheckout((ii)=>{
            res.send(ii);
        }, checkout , status);
    }
    else{
        res.status(201);
        res.send("Missing checkout and status parameters");
    }
});



app.get('/ap1/v1/getCheckoutDetails' , async (req, res) =>{
    let shopID = req.query.shopId;
    if(shopID != undefined){
        try{
            let checkoutQuery = product.getCheckoutHistory(shopID);
            await sql.connect(DBUtil.syncConfig)
            let checkoutQueryResponse = await sql.query(checkoutQuery);
            let userID = 0;

            console.log(checkoutQueryResponse);

            let len = checkoutQueryResponse['recordset'].length;
            let responseConsturct = [];
            for(let i = 0 ;i <len ;i++) {
                userID = checkoutQueryResponse['recordset'][i]['userId'];

                let userDetailQuery = user.getUserInfo(userID);
                await sql.connect(DBUtil.syncConfig)
                let userDetailQueryResponse = await sql.query(userDetailQuery);

                let response = {};
                response['checkoutInfo'] = checkoutQueryResponse['recordset'][i];
                response['userInfo'] = userDetailQueryResponse['recordset'][0];
                responseConsturct.push(response);

            }
           

            
            res.send(responseConsturct);

            
        }
        catch(e){
            res.status(201);
            res.send("Internal server error" + e);
        }
        
    }
    else {
        res.status(201);
        res.send("Missing shopId parameters");
    }
});

app.post('/upload1' , (req, res) =>{
    console.log(req.files)
    console.log(req.params);
    console.log(req.query);
    console.log(req.body);
    var files = getFilesObjects(req.files, 'thefile');


                for(let photoIte = 0; photoIte < files.length ; photoIte++) {
                    let photoKeyReq = files[photoIte];
                    let photoFileName = files[photoIte].name + Math.floor(+new Date() / 1000);
                    let fileContent  = Buffer.from(files[photoIte].data, 'binary');
                    console.log(photoFileName);
                    console.log(fileContent);
                }

res.send("OK");
});


getFilesObjects = (obj, key) =>{
    let filePointer = [];
    if(obj[key]!= undefined && obj[key].name != undefined){
        filePointer.push(obj[key]);
        return filePointer;
    }
    for(let photoIte = 0; photoIte < obj[key].length ; photoIte++) {
        filePointer.push(obj[key][photoIte]);         
    }
    return filePointer;
}


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

    // check for mobile as primary kkey
        let adduniqueUserQuery = user.uniqueUser(req.query.mobile);
        await sql.connect(DBUtil.syncConfig)
        let adduniqueUserQueryResponse = await sql.query(adduniqueUserQuery);
        if(adduniqueUserQueryResponse['recordset'].length != 0){
            res.status(201);
            res.send("User with this Mobile Number Already Registered.");
            return;
        }

        res.send("OK");
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


 app.get('/api/v1/sendOTP', (req, res) =>{
    let mobile = req.query.mobile;
    if(mobile == null || mobile == undefined) {
        res.status(201);
        res.send("Missing Mobile Number Parameter");
        return;
    }
    var otp = "1111";//Math.floor(1000 + Math.random() * 9000);
    var sns = new AWS.SNS();

    sns.publish({
            Message: "Vevodus OTP is "+ otp,
            Subject: 'Admin',
            PhoneNumber:"+91" + mobile
    }, (err, result)=>{
        if(err != null){
            res.status(201);
            res.send("Server Error in sending OTP.")
            console.log("result",err,result)
        }
        else{
            user.addOTP((i) =>{
                if(i == "OK") {
                    res.send("Successfully generated the OTP");
                }
                else{
                    res.status(201);
                    res.send("Server Error in sending OTP.")
                }
            }, mobile, otp);
            
        }
    });

 })

 app.post('/api/v1/verifyOTP',  (req, res) =>{
    let mobile = req.body.mobile;
    let otp = req.body.otp;
    let app = req.body.app

    let reqJSON = {
        'mobile' : mobile,
        'otp' : otp
    };

    // iterate for missong
    for(var k in reqJSON){
        if(reqJSON[k] == undefined) {
            res.status(201);
            res.send("Missing Attributes = " + k);
            return;
        }
    }

    if(app == undefined) {
        reqJSON['app'] = 'Admins';
    }
    else{
        reqJSON['app'] = app;
    }

    user.authenticate2((i) => {
        console.log(i)
        if(i != 'ERROR') {
            let length = i.length;
            console.log("length" + i.length);
            if(length == 1) {
                    let userIDResp = i[0]['userId'];
                    console.log(userIDResp);

                    user.userDetailsInfo((umesh) =>{

                                            if(reqJSON.app == 'SELLER') {
                        shopDetail.getShopDetails((ii) =>{

                                user.logout((i2) =>{
                                    if(i2 == 'OK'){
                                    //res.send("logout success");
                                }
                                else{
                                    //res.status(201);
                                    //res.send("logout error");
                                }
                            }, mobile)
                                let responseConsturct = {};
                                responseConsturct['userDetail'] = umesh;
                                responseConsturct['shopDetail'] = ii;
                                res.status(200);
                                res.send(responseConsturct);
                        }, userIDResp)

                    }
                    else {
                        let responseConsturct = {};
                                responseConsturct['userDetail'] = umesh;
                        res.status(200);
                        res.send(responseConsturct);
                    }

                    }, userIDResp);

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
    }, reqJSON);

 })

  app.get('/api/v1/logout', (req, res) =>{
    let mobile = req.query.mobile;
    if(mobile == null || mobile == undefined) {
        res.status(201);
        res.send("Missing Mobile Number Parameter");
        return;
    }
    user.logout((i) =>{
        if(i == 'OK'){
            res.send("logout success");
        }
        else{
            res.status(201);
            res.send("logout error");
        }
    }, mobile)

 })

app.get('/api/v', (req, res)=>{
    res.sendfile('connect.html');
  })

app.get('/api/v1/customer/history', (req, res)=>{
    let userID = req.query.userId;
    let historyType = req.query.historyType;
    if(userID != undefined && historyType != undefined){
        if(historyType == 'ACTIVE'){
            userCheckout.getActiveUserCheckoutDetails((i)=>{
                res.send(i);
            }, userID);
        }
        else if(historyType == 'PAST'){
            userCheckout.getPastUserCheckoutDetails((i)=>{
                res.send(i);
            }, userID);
        }
        else{
            res.status(201);
            res.send("unsupported history type.");
        }
    }
    else{
        res.status(201);
        res.send("Missing either userId or historyType parameters.");
    }
})

app.post('/api/v1/user/gift', (req, res) =>{
   
    let userID = req.body.userId;
    let gift = req.body.gift;
    if(userID != undefined && gift != undefined) {
        user.addGift((ii)=>{
            res.send(ii);
        }, userID , gift);
    }
    else{
        res.status(201);
        res.send("Missing userId and gift parameters");
    }
});

app.get('/api/v1/checkoutInfo', async(req, res)=>{
    let checkoutID = req.query.checkoutId;
    if(checkoutID != undefined){
        let checkoutInfoQuery = userCheckout.getParticularCheckout(checkoutID);
        await sql.connect(DBUtil.syncConfig)
        let checkoutInfoResponse = await sql.query(checkoutInfoQuery);
        console.log(checkoutInfoResponse);
        if(checkoutInfoResponse['recordset'][0] == undefined){
            res.status(201);
            res.send("Invalid checkoutid");
            return;
        }
        let productid = checkoutInfoResponse['recordset'][0]['productId'];


        let shopDetailQuery = shopDetail.getShopDetailByProductID(productid);
        await sql.connect(DBUtil.syncConfig)
        let shopDetailResponse = await sql.query(shopDetailQuery);

        let response = {};
        response['checkoutDetails'] = checkoutInfoResponse['recordset'][0];
        response['shopInfo'] = shopDetailResponse['recordset'][0];
         res.send(response);
    }
    else{
        res.status(201);
        res.send("Missing checkoutID parameters");
    }
})
 



var server = app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`)
})
