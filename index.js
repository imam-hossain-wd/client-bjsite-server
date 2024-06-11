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

        // user operation

        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const query = {};
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/user/:id", async (req, res) => {
            const userId = req.params.id;
            const query = { user_id: userId };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });


        app.get("/agents", async (req, res) => {
            const query = {};
            const result = await agentCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/agent", async (req, res) => {
            const agentId = req.body.agent_id;
            const query = { agent_id: agentId };
            const result = await agentCollection.find(query).toArray();
            res.send(result);
        });


        app.get("/customer-services", async (req, res) => {
            const query = {};
            const result = await customerServiceCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/customer-service", async (req, res) => {
            const id = req.body.id_no;
            const query = { id_no: id };
            const result = await customerServiceCollection.find(query).toArray();
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

        // Update User
        app.patch("/user/:id", async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const query = { user_id: id };
            const updateDoc = {
                $set: updatedUser,
                };
                const result = await userCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });


        // Update Agent
        app.patch("/agent/:id", async (req, res) => {
            const id = req.params.id;
            const updatedAgent = req.body;
            const query = { agent_id: id };
            const updateDoc = {
                $set: updatedAgent,
            };
            const result = await agentCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        // Update Customer Service
        app.patch("/customer-service/:id", async (req, res) => {
            const id = req.params.id;
            const updatedCustomerService = req.body;
            const query = { id_no: id.toString() };
            const updateDoc = {
                $set: updatedCustomerService,
            };
            const result = await customerServiceCollection.updateOne(query, updateDoc);

            console.log(result, 'result');
            
            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Customer service record not found" });
            }
            
            res.send(result);
        });
        

        // Delete User
    

        // Delete Agent
        app.delete("/agent/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await agentCollection.deleteOne(query);
            res.send(result);
        });

        // Delete Customer Service
        app.delete("/customer-service/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await customerServiceCollection.deleteOne(query);
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