const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const port = process.env.PROT || 5000;
const SALT_ROUND = Number(process.env.BCRYPT_SALT_ROUND);


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
    const homepageCollection = client.db("bjwala").collection("homepage");

    try {

        // user operation

        // app.post("/user", async (req, res) => {
        //     try {
        //         const user = req.body;
        //         console.log(user, 'user');
        //         const userId = user?.user_id;
        //         const existingUser = await userCollection.findOne({ user_id: userId });

        //         if (existingUser && existingUser.role === user.role) {
        //             return res.status(400).send({ error: "User already exists" });
        //         }

        //         if (user.password) {
        //             user.password = await bcrypt.hash(user.password, SALT_ROUND);
        //         }

        //         const result = await userCollection.insertOne(user);
        //         console.log(result, 'result');
        //         res.send(result);
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).send({ error: "An error occurred while creating the user" });
        //     }
        // });

        app.post("/user", async (req, res) => {
            try {
                const user = req.body;
                console.log(user, 'user');
                const userId = user?.user_id;
                const existingUser = await userCollection.findOne({ user_id: userId });
        
                if (existingUser) {
                    const sameRoleUser = await userCollection.findOne({ user_id: userId, role: user.role });
                    if (sameRoleUser) {
                        return res.status(400).send({ error: "User with the same role already exists" });
                    }
                }
        
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, SALT_ROUND); 
                }
                
                const result = await userCollection.insertOne(user);
                console.log(result, 'result');
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "An error occurred while creating the user" });
            }
        });
        


        app.post("/login", async (req, res) => {
            try {
                const { email, password } = req.body;
                console.log(email, 'email');

                // Find the user by email
                const user = await userCollection.findOne({ email });
                console.log(user, 'user');
                console.log(email, password, 'email, password');

                // If the user is not found, return an error
                if (!user) {
                    return res.status(400).send({ error: "Invalid email or password" });
                }

                // Compare the provided password with the hashed password in the database
                const isPasswordValid = await bcrypt.compare(password, user.password);

                // If the password is invalid, return an error
                if (!isPasswordValid) {
                    return res.status(400).send({ error: "Invalid email or password" });
                }

                // Create a JWT token
                const token = jwt.sign(
                    { userId: user._id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                console.log(token, 'token');

                // Send the response with the token and user information
                res.send({
                    message: "Login successfully",
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        phone: user.phone,
                        role: user.role
                    }
                });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "An error occurred during login" });
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

                const users = await userCollection.find(query).skip(skip).sort({ user_id: 1 }).limit(limit).toArray();
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

        // find by agent id 

        app.get("/user/agent/:id/:role", async (req, res) => {
            try {
                const id = req.params.id;
                const role = req.params.role;
                const query = { user_id: id , role:role};
                const result = await userCollection.findOne(query);

                const message = {
                    message: 'আপনি যে এজেন্ট খুজচ্ছেন তার নাম আমাদের লিষ্টে নেই |দয়া করে কাষ্টমার সার্ভিসে যোগাযোগ করুন।',
                    helpline: "কাষ্টমার সার্ভিস এর নাম্বার গুলো পেতে এই লিঙ্ক এ ক্লিক করুন"
                }

                if (!result) {
                    return res.status(404).send({ message });
                }

                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "An error occurred while fetching the agent" });
            }
        });



        app.get("/user/:id", async (req, res) => {
            try {
                const id = req.params.id;

                // Validate ObjectId
                if (!ObjectId.isValid(id)) {
                    throw new Error("Invalid user ID");
                }

                const query = { _id: new ObjectId(id) };
                const result = await userCollection.findOne(query);

                if (!result) {
                    throw new Error("User not found");
                }

                res.send(result);
            } catch (error) {
                console.error(error);

                if (error.message === "User not found") {
                    res.status(404).send({ error: error.message });
                } else if (error.message === "Invalid user ID") {
                    res.status(400).send({ error: error.message });
                } else {
                    res.status(500).send({ error: "An error occurred while fetching the user" });
                }
            }
        });



        app.patch("/user/:id", async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            console.log(updatedUser, 'updatedUser');
            console.log(id, 'id');

            // Validate ObjectId
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: 'Invalid user ID' });
            }

            const query = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: updatedUser,
            };

            try {
                const result = await userCollection.updateOne(query, updateDoc);
                res.send(result);
            } catch (error) {
                console.error('Error updating user:', error);
                res.status(500).send({ error: 'Failed to update user' });
            }
        });

        app.delete("/user/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            console.log(result, 'result');
            res.send(result);
        });



        app.post("/homepage", async (req, res) => {
            try {
                const { customer_service_banner, master_agent_banner } = req.body;

                // Validate input
                if (!customer_service_banner || !master_agent_banner) {
                    return res.status(400).send({ error: "Both banners are required" });
                }

                const result = await homepageCollection.insertOne({
                    customer_service_banner,
                    master_agent_banner,
                    createdAt: new Date(),
                });

                res.send(result);
            } catch (error) {
                console.error("Error adding homepage banners:", error);
                res.status(500).send({ error: "An error occurred while adding homepage banners" });
            }
        });


        // PATCH route to update an existing banner
        app.patch("/homepage/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const { customer_service_banner, master_agent_banner } = req.body;

                // Validate ObjectId
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ error: "Invalid ID" });
                }

                const query = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        ...(customer_service_banner && { customer_service_banner }),
                        ...(master_agent_banner && { master_agent_banner }),
                        updatedAt: new Date(),
                    },
                };

                const result = await homepageCollection.updateOne(query, updateDoc);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ error: "Banner not found" });
                }

                res.send(result);
            } catch (error) {
                console.error("Error updating homepage banner:", error);
                res.status(500).send({ error: "An error occurred while updating homepage banner" });
            }
        });

        app.get("/homepage", async (req, res) => {
            try {
                const query = {};
                const homepageBanner = await homepageCollection.findOne(query);

                if (!homepageBanner) {
                    return res.status(404).send({ error: "Homepage banner not found" });
                }

                res.send(homepageBanner);
            } catch (error) {
                console.error("Error fetching homepage banner:", error);
                res.status(500).send({ error: "An error occurred while fetching homepage banner" });
            }
        });




    } finally {
    }
};
run().catch(console.log);

app.get("/", async (req, res) => {
    res.send("server is running");
});

app.listen(port, () => console.log(`server running on ${port}`));