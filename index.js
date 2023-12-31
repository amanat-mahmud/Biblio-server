require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kd8d4hj.mongodb.net/biblio?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('biblio');
    const bookCollection = db.collection('book');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.toArray();
      res.send({ status: true, data: book });
    });
    app.get('/books/:email', async (req, res) => {
      const email = req.params.email;
      const cursor = bookCollection.find({user:email});
      const book = await cursor.toArray();
      res.send({ status: true, data: book });
    });
    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;
      const book = await bookCollection.findOne({_id:ObjectId(id)});
      res.send({ status: true, data: book });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });
    app.delete('/book/:email/:title', async (req, res) => {
      const email = req.params.email;
      const title = req.params.title;
      const result = await bookCollection.deleteOne({ title:title,user:email});
      res.send(result);
    });

    app.put('/book/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:ObjectId(id)};
      const options = { upsert: true };
      const title = req.body.title;
      const author = req.body.author;
      const genre = req.body.genre;
      const date = req.body.date;
      const updatedDoc = {
        $set:{
            title:title,
            author:author,
            genre:genre,
            date:date
        }
    }
      const book = await bookCollection.updateOne(filter,updatedDoc,options);
      res.send(book);
  })

    app.post('/comment/:id', async (req, res) => {
      const bookId = req.params.id;
      console.log(bookId);
      const comment = req.body.comment;
      console.log(bookId);
      console.log(comment);

      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { comments: comment } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Book not found or comment not added');
        res.json({ error: 'Book not found or comment not added' });
        return;
      }

      console.log('Comment added successfully');
      res.json({ message: 'Comment added successfully' });
    });

    app.get('/comment/:id', async (req, res) => {
      const bookId = req.params.id;
      console.log("get",bookId);
      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    });

    // app.post('/user', async (req, res) => {
    //   const user = req.body;

    //   const result = await userCollection.insertOne(user);

    //   res.send(result);
    // });

    // app.get('/user/:email', async (req, res) => {
    //   const email = req.params.email;

    //   const result = await userCollection.findOne({ email });

    //   if (result?.email) {
    //     return res.send({ status: true, data: result });
    //   }

    //   res.send({ status: false });
    // });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
