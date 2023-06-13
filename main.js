const express = require('express');

const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

const logic = require('./Scripts/Logic.js');
const mintingLogic = require('./Scripts/mintingLogic.js');

var allJsonDataInFolder = [];

app.set('view engine', 'ejs');

// This is so we can read prom the public folder in HTML files, aka read images etc
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/Styles'));
//process.env.PORT
app.listen(3000, () => {
    console.log(`Server NOW running on port` + process.env.PORT);
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
    res.render('details', { data: data, companyData: logic.companyData, CID: logic.CIDdata});
  });

// app.get('/register', async (req, res) => {
//     console.log("This gets called");
//     const data = await logic.GetAllJsonsInFolder();
//     res.render('Index', {companyData: data});
// });

app.get('/register', async (req, res) => {
    res.render('Register');
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/register', urlencodedParser, async function (req, res) {
    try {
        const result = await logic.UploadToJson(req, res);
        if (result) {
          res.send('Successfully registered!');
        }
      } catch (error) {
        // Handle error, e.g., send an error response
        res.sendStatus(500);
      }
});

app.get('/register/update', async (req, res) => {
    res.render('Register');
});

app.post('/register/update', urlencodedParser, async function (req, res) {
    try {
        const result = await logic.UpdateToJson(req, res);
        if (result) {
          res.send('Successfully updated!');
        }
      } catch (error) {
        // Handle error, e.g., send an error response
        res.sendStatus(500);
      }
});

//This just gets it
app.get('/isWalletIDRegistered', async (req, res) => {
    const result = await logic.IsWalletIDRegistered(req.query.address);
    res.json(result);
});

// mintingLogic.mainFunction();
// const interval = setInterval(mintingLogic.mainFunction(), 3 * 60 * 1000);