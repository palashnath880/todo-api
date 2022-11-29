const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.cjfgfqu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const todosCollection = client.db('todo').collection('todos');

        // create a todo
        app.post('/todo', async (req, res) => {
            const todo = req.body;
            const result = await todosCollection.insertOne(todo);
            res.send({ todoId: result.insertedId });
        });

        // get all todos
        app.get('/todos', async (req, res) => {
            const query = {};
            const result = await todosCollection.find(query).toArray();
            res.send(result);
        });

        // get todo by specific todo id 
        app.get('/todo/:id', async (req, res) => {
            const todoId = req.params.id;
            const query = { _id: ObjectId(todoId) };
            const result = await todosCollection.findOne(query);
            if (result) {
                return res.send(result);
            } else {
                res.status(404).send({ message: 'Todo not found' });
            }
        });

        // todo status updated
        app.post('/todo/:id/done', async (req, res) => {
            const todoId = req.params.id;
            const updatedQuery = { _id: ObjectId(todoId) };
            const updatedDoc = {
                $set: {
                    status: 'done'
                }
            };
            const result = await todosCollection.updateOne(updatedQuery, updatedDoc);
            if (result) {
                res.send({ message: 'Todo status updated successfully.' });
            } else {
                res.send(result);
            }
        });

        // todo delete by specific id 
        app.delete('/todo/:id/delete', async (req, res) => {
            const todoId = req.params.id;
            const deleteQuery = { _id: ObjectId(todoId) };
            const result = await todosCollection.deleteOne(deleteQuery);
            if (result?.acknowledged) {
                res.send({ message: 'Todo deleted successfully' });
            } else {
                res.send(result);
            }
        });

    } finally {

    }
}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('*', (req, res) => {
    res.status(404).send({ message: 'Not Found' });
});

app.listen(port);