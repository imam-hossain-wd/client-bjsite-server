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

    try {

        // user operation

        app.post("/user", async (req, res) => {
            try {
                const user = req.body;
                const userId = user?.user_id;
                const existingUser = await userCollection.findOne({ user_id: userId });

                if (existingUser) {
                    return res.status(400).send({ error: "User already exists" });
                }

                const result = await userCollection.insertOne(user);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "An error occurred while creating the user" });
            }
        });

        app.get("/users", async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const role = req.query.role;

                let query = {};
                if (role) {
                    query.role = role;
                }

                const users = await userCollection.find(query).skip(skip).limit(limit).toArray();
                const totalUsers = await userCollection.countDocuments(query);

                const response = {
                    users,
                    page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers
                };

                res.send(response);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "An error occurred while fetching users" });
            }
        });

        // find user by role

        app.get("/users/role/:role", async (req, res) => {
            try {
                const role = req.params.role;
                const query = { role: role };
                const result = await userCollection.find(query).toArray();

                if (result.length === 0) {
                    return res.status(404).send({ message: "No users found with the specified role" });
                }

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "An error occurred while fetching users by role" });
            }
        });


        app.get("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.patch("/user/:id", async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: updatedUser,
            };
            const result = await userCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            console.log(result, 'result');
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