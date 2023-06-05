const express = require('express');
const app = express();

const logic = require('./Scripts/Logic.js');

var allJsonDataInFolder = [];

app.set('view engine', 'ejs');

// This is so we can read prom the public folder in HTML files, aka read images etc
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/Styles'));

app.listen(3000, () => {
    console.log(`Server NOW running on port 3000`);
});
  
app.get('/', async (req, res) => {
    console.log("This gets called");
    allJsonDataInFolder = await logic.GetAllJsonsInFolder();
    res.render('Index', {companyData: allJsonDataInFolder});
});

//This refreshes it
app.get('/sortCompanyData', (req, res) => {
    const selectedOption = req.query.selectedOption;
    
    allJsonDataInFolder = logic.SortCompanyData(allJsonDataInFolder, selectedOption);
    
    res.json(allJsonDataInFolder);
});

//This just gets it
app.get('/getSortCompanyData', (req, res) => {
    res.json(allJsonDataInFolder);
});

app.get('/details', (req, res) => {
    // Get the data from the request query
    const data = JSON.parse(req.query.data);
  
    // Render the EJS template with the data
    res.render('details', { data });
  });

// app.get('/register', async (req, res) => {
//     console.log("This gets called");
//     const data = await logic.GetAllJsonsInFolder();
//     res.render('Index', {companyData: data});
// });