const express = require('express');
const app = express();

const logic = require('./Scripts/Logic.js');

app.set('view engine', 'ejs');

// This is so we can read prom the public folder in HTML files, aka read images etc
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/Styles'));

app.listen(3000, () => {
    console.log(`Server NOW running on port 3000`);
});
  
app.get('/', async (req, res) => {
    console.log("This gets called");
    const data = await logic.GetAllJsonsInFolder();
    res.render('Index', {companyData: data});
});

// app.get('/register', async (req, res) => {
//     console.log("This gets called");
//     const data = await logic.GetAllJsonsInFolder();
//     res.render('Index', {companyData: data});
// });