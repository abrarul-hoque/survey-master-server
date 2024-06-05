const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1qcsvas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const surveyCollection = client.db('surveyMaster').collection('surveys');
        const userCollection = client.db('surveyMaster').collection('users');

        //JWT releted api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "1h"
            });
            res.send({ token });
        })


        //user releted api
        //get users data
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        //Post user to mongodb
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "User already exist!", insertedId: null });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })


        app.get('/surveys', async (req, res) => {
            const result = await surveyCollection.find().toArray();
            res.send(result);
        })

        app.get('/surveys/surveyDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await surveyCollection.findOne(query);
            res.send(result);
        })


        //Vote to a survey
        app.post('/vote', async (req, res) => {

        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Survey Master is Running")
})
app.listen(port, (req, res) => {
    console.log(`Survey Master Server is running on Port: ${port}`)
})