const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId =require('mongodb').ObjectId;
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.4hsow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run(){
    try{
        await client.connect();


        const database = client.db('luxary-gold');
        const luxaryCollection = database.collection('products');
        const buyerCollection = database.collection('buyerinfo');
        const userCollection = database.collection('user');
        const reviewsCollection = database.collection('reviews');



        app.get('/products',async(req,res)=>{
            const cursor =luxaryCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //product info
        app.post('/products', async(req,res)=>{
            const productInfo = req.body;
            const result = await luxaryCollection.insertOne(productInfo);
            res.json(result);
        })

        //reviews posting
        app.post('/reviews',async(req,res)=>{
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })

        //reviews getting
        app.get('/reviews', async (req,res)=>{
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        

        //buyer info
        app.post('/buyerinfo', async(req,res)=>{
            const buyerInfo = req.body;
            const result = await buyerCollection.insertOne(buyerInfo);
            res.json(result);
        })

         // getting all Order
         app.get('/allorders',async(req,res)=>{
            const cursor = buyerCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });


        //geting order by email
        app.get('/buyerinfo',async (req,res)=>{
            const email = req.query.email;
            const query = {email:email}
            const cursor = buyerCollection.find(query);
            const buyerInfo = await cursor.toArray();
            res.send(buyerInfo)

        })

       

        app.get('/user/:email',async(req,res)=>{
            const email = req.params.email;
            const query = {email:email};
            const user = await userCollection.findOne(query); 
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin= true;
            }
            res.json({admin:isAdmin}); 
        })

        //save user
        app.post('/user',async (req,res)=>{
            const user= req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        })


        //filer user
        app.put('/user',async(req,res)=>{
            const user = req.body;
            const filter = { email:user.email };
            const options = {upsert:true};
            const updateDoc = {$set:user};
            const result = await userCollection.insertOne(filter,updateDoc,options);
            res.json(result);
        })

        //make admin
        app.put('/user/admin',async (req,res)=>{
            const user = req.body;
            const filter = {email:user.email};
            const updateDoc = {$set: {role:'admin'}}
            const result = await userCollection.updateOne(filter,updateDoc);
            res.json(result);

        })

        //delete order 
        app.delete('/buyerinfo/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id:ObjectId(id)};
            const result = await buyerCollection.deleteOne(query);
            res.json(result);
        })
    

    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('this server making for assignment12')
})

app.listen(port,()=>{
    console.log('server is running on',port);
})