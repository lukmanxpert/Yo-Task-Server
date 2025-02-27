require('dotenv').config()
const express = require('express');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 7000
app.use(express.json())
app.use(cors())

// mongodb start //
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l73rt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    const database = client.db("TaskManager");
    const usersCollection = database.collection("users");
    const taskCollection = database.collection("task");
    
    // user post api
    app.post('/users', async (req, res) => {
      const usersBody = req.body;
      const query = { userEmail: usersBody.userEmail }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await usersCollection.insertOne(usersBody)
      res.send(result)
    })

    // add task api
    app.post('/task', async (req, res) => {
      const taskBody = req.body
      const result = await taskCollection.insertOne(taskBody)
      res.send(result)
    })

    // get all task api
    app.get('/task/:email', async (req, res) => {
      const email = req.params.email
      const query = {userEmail: email }
      const result = await taskCollection.find(query).toArray()
      res.send(result)
    })

    // update task api
    app.put('/task/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updateTask = req.body
      const updateDoc = {
        $set: {
          title: updateTask.title,
          description: updateTask.description,
          category: updateTask.category,
          date: updateTask.date
        }
      }
      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Yo'Task Running")
})

app.listen(port, () => {
  console.log("Server Runnig", port);
})
