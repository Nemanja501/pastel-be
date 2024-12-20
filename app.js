const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);

app.use((err, req, res, next) =>{
  const message = err.message || 'An error occurred';
  console.log(err.statusCode);
  const code = err.statusCode || 500;
  const data = err.data || [];
  res.status(code).json({message, data});
})

mongoose.connect('mongodb+srv://nemanjavulin5:WoWwFd249hQHHYkr@cluster0.mtu0rep.mongodb.net/pastel?retryWrites=true&w=majority&appName=Cluster0').then(() =>{
    app.listen(port);
}).catch(err => console.log(err));