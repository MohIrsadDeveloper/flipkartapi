const express = require('express');
const app = express();
const env = require('dotenv')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongo = require('mongodb');
const mongoose = require('mongoose')

const router = require('./Routes/router')

env.config();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

const MongoClient = mongo.MongoClient;
// const mongouri = 'mongodb://localhost:27017/Flipkart';
const mongouri = process.env.Mongourl
let db;

mongoose.connect(mongouri, {
    useNewUrlParser : true,
})
.then(data => {
    console.log("Mongo Database Connected...");
})
.catch(err => {
    console.log("Failed While Connection");
})


app.use('/', router);

app.get('/', (req, res) => {
    res.json({
        msg: "Welcome to flipkart Clone"
    })
});

app.get("/subheader", (req,res) => {
    db.collection("SubHeader").find().toArray((err,result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
})

app.get("/products", (req, res) => {
    let productId = Number(req.query.product_id);
    let query = {}
    
    if (productId) {
        query = { "product.product_type_id": productId }
    }

    db.collection("Home").find(query).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

app.get('/random', (req, res) => {
    db.collection('Home').aggregate([{ $sample: { size: 8 } }]).toArray((err, result) => {
        if (err) throw err;
        res.json(result)
    })
})

app.get('/list', (req, res) => {
    let productId = Number(req.query.product_id)
    let brandId = Number(req.query.brand_id);

    let query = {}

    if (productId && brandId) {
        query = { product_type_id: productId, "brand.brand_id": brandId }
    }
    else if (productId) {
        query = { product_type_id: productId }
    }
    db.collection('ProductList').find(query).toArray((err, result) => {
        if (err) throw err;
        res.json(result);
    })
})

app.post('/detail/:id', (req,res) => {
    let itemId = Number(req.params.id);
    console.log(itemId);

    db.collection('ProductList').find({product_id : itemId}).toArray((err,result) => {
        if (err) throw err;
        res.json(result);
    })
})

app.post('/placeOrder', (req,res) => {
    db.collection("Orders").insert(req.body, (err, result) => {
        if (err) throw err;
        res.json({
            msg : "Order Added",
            data : result
        })
    })
})


app.delete('/deleteOrder', (req,res) => {
    db.collection('Orders').remove({}, (err,result) => {
        if (err) throw err;
        res.json(result)
    })
})

app.patch('/updateOrder/:id', (req,res) => {
    let userOrderId = Number(req.params.id);

    db.collection('Orders').UpdateOne(
        {orderId : userOrderId},
        {$set : {
            "status" : req.body.status,
            "date" : req.body.date,
            "bank_name" : req.body.bank_name,
        }}, (err,result) => {
            if (err) throw err;
            res.json('Status Updated Successfully');
        }
    )
})



MongoClient.connect(mongouri, (err, client) => {
    if (err) {
        console.log(`Error While Connecting` + err);
    } else {
        db = client.db("Flipkart");
        console.log(`Database Connected...`);
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Application is running on http://localhost:${PORT}`);
});