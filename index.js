const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@cluster0.abaz9hk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const itemCollection = client.db("techZooDB").collection("items");
    const brandCollection = client.db("techZooDB").collection("brand");
    const myCartCollection = client.db("techZooDB").collection("myCart");

    app.get("/items", async (req, res) => {
      const data = await itemCollection.find().toArray();
      res.send(data);
    });

    app.get("/brand", async (req, res) => {
      const data = await brandCollection.find().toArray();
      res.send(data);
    });

    app.post("/items", async (req, res) => {
      const data = req.body;
      const post = await itemCollection.insertOne(data);
      res.send(post);
    });

    app.get("/items/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await itemCollection.findOne(query);
        console.log(result);
        if (!result) {
          res.status(404).send("Item not found");
          return;
        }
        res.send(result);
      } catch {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = {
        $set: {
          name: data.name,
          brand: data.brand,
          type: data.type,
          price: data.price,
          rating: data.rating,
          description: data.description,
          image: data.image,
        },
      };
      const result = await itemCollection.updateOne(
        filter,
        updatedItem,
        options
      );
      res.send(result);
    });

    app.get("/myCart", async (req, res) => {
      const result = await myCartCollection.find().toArray();
      res.send(result);
    });

    app.post("/myCart", async (req, res) => {
      const item = req.body;
      // const query = {_id : new ObjectId(item)}
      console.log(item);
      const result = await myCartCollection.insertOne(item);
      res.send(result);
    });

    app.get("/myCart/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = {
          _id: id,
        };
        const result = await myCartCollection.findOne(query);
        console.log(result);
        if (!result) {
          res.status(404).send("Item not found");
          return;
        }
        res.send(result);
      } catch {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/myCart/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await myCartCollection.deleteOne(query);
      res.send(result);
    });

    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
