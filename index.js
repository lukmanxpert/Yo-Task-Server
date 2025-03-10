require('dotenv').config()
const express = require('express');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l73rt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("TaskManager");
    const usersCollection = database.collection("users");
    const taskCollection = database.collection("task");

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

    app.post('/task', async (req, res) => {
      const taskBody = req.body
      const result = await taskCollection.insertOne(taskBody)
      res.send(result)
    })

    app.get('/task/:email', async (req, res) => {
      const email = req.params.email
      const query = {userEmail: email }
      const result = await taskCollection.find(query).toArray()
      res.send(result)
    })
    
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


    app.delete("/task/:id",async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })

    app.put('/task/update/:id', async (req, res) => {
      const { id } = req.params;
      const { category } = req.body;
  
      try {
          const result = await taskCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: { category: category } }
          );
          res.send({ success: true, message: "Task category updated" });
      } catch (error) {
          res.status(500).send({ success: false, message: "Failed to update category" });
      }
  }); 
    

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Task Management started!!!!!")
})

app.listen(port, () => {
  console.log("Server Runnig", port);
})
