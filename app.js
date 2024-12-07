const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use((req, res, next) =>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.use(authRoutes);
app.use(postRoutes);

app.use((err, req, res, next) =>{
  const message = err.message || 'An error occurred';
  const code = err.statusCode || 500;
  const data = err.data || [];
  res.status(code).json({message, data});
})

mongoose.connect('mongodb+srv://nemanjavulin5:WoWwFd249hQHHYkr@cluster0.mtu0rep.mongodb.net/pastel?retryWrites=true&w=majority&appName=Cluster0').then(() =>{
    app.listen(port);
}).catch(err => console.log(err));