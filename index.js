const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
require('dotenv').config();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5pjon.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('time_world');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users'); 
        const reviewsCollection = database.collection('reviews'); 
        const bookingCollection = database.collection('bookings'); 
        
        
       //GET API products
       app.get('/products' , async (req, res) => {
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
       })
      
       // single service display GET api
       app.get('/products/:id' , async (req, res) => {
        const result = await productsCollection.find({_id:ObjectId(req.params.id)}).toArray();
       
        res.send(result);
     })
   
     //booking
     app.post('/booking', async (req, res) =>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    })
    app.get('/booking', async (req, res) =>{
      const bookingItems = bookingCollection.find({});
      const result = await bookingItems.toArray();
      res.json(result);
    })
    
       //post products api call add products area

       app.post('/products', async (req, res) =>{
         const product = req.body;
         const result = await productsCollection.insertOne(product);
         res.json(result);
       })
      


      //post and get reviews api call 

      app.get('/reviews' , async (req, res) => {
        const cursor = reviewsCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
     })

      app.post('/reviews', async (req, res) =>{
        const review = req.body;
        const reviewResult = await reviewsCollection.insertOne(review);
        res.json(reviewResult);
      })

        //make admin role anyone else
       app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin') {
          isAdmin = true;
         
        }
        res.json({admin: isAdmin});
      })
        //saved registered user information 
       app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      })

      //update users google login
      app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert: true};
        const updateDoc = {
          $set: user
        };
        const result =  await usersCollection.updateOne(filter, updateDoc, options); 
        res.json(result);
   });

    //add admin 

    app.put('/users/admin',  async (req, res) => {
        const user = req.body;
        const requester = req.decodedEmail;
      
            const filter = {email: user.email};
            const updateDoc = {
              $set: { role: 'admin'}
            };
            const result =  await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

      })

      //DELETE service API
  app.delete('/products/:_id',async(req, res) => {
    const id = req.params._id;
    const query = {_id:ObjectId(id)};
    const result = await productsCollection.deleteOne(query);
    res.json(result);

})
app.delete('/booking/:_id',async(req, res) => {
  const id = req.params._id;
  const query = {_id:ObjectId(id)};
  const result = await bookingCollection.deleteOne(query);
  res.json(result);

})
        
    }
    finally{
        //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello time world')
})

app.listen(port, () => {
    console.log(`Listening at ${port}`);
})