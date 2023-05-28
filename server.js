const port = 3000;
import express from '../node_modules/express/lib/express.js';
// const express = require('../express');
const app = express();
const upload = require('express-fileupload');


app.use(upload());

app.get('/register', (req,res) => {
  res.sendFile(__dirname + '/register')
})

app.post('/register',(req,res) => {
  console.log('jdjajdsmd')
  if (req.cname){
  console.log(req.cname)
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
