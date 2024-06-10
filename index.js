const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const port = process.env.PROT || 5000;

require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());


const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});


const run = async () => {

    const userCollection = client.db("bjwala").collection("user");
    const agentCollection = client.db("bjwala").collection("agent");
    const customerServiceCollection = client.db("bjwala").collection("customer_service");

    try {

        //all get route from database

        app.get("/user", async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/agent", async (req, res) => {
            const query = {};
            const result = await agentCollection.find(query).toArray();
            res.send(result);
        });
        app.get("/customer-service", async (req, res) => {
            const query = {};
            const result = await customerServiceCollection.find(query).toArray();
            res.send(result);
        });

        ///all post route from database
        
        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.post("/agent", async (req, res) => {
            const user = req.body;
            const result = await agentCollection.insertOne(user);
            res.send(result);
        });

        app.post("/customer-service", async (req, res) => {
            const user = req.body;
            const result = await customerServiceCollection.insertOne(user);
            res.send(result);
        });


    } finally {
    }
};
run().catch(console.log);

app.get("/", async (req, res) => {
    res.send("server is running");
});

app.listen(port, () => console.log(`server running on ${port}`));