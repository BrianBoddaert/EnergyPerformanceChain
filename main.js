const express = require('express');

const bodyParser = require('body-parser');
const fs = require('fs');

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
    const data = await logic.GetAllJsonsInFolder();
    res.render('Index', {companyData: data});
});

app.get('/register', async (req, res) => {
    res.render('Register');
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/register', urlencodedParser, function (req, res) {
    console.log(req.body);

    // Read the existing JSON file
    fs.readFile('RegisteredCompanies', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            // Handle error, e.g., send an error response
            res.sendStatus(500);
            return;
        }

        try {
            // Parse the existing JSON data into a JavaScript object
            const jsonData = JSON.parse(data);

            // Add the req.body data to the desired list in the JavaScript object
            jsonData.push(req.body);

            // Convert the updated JavaScript object back to JSON
            const updatedJsonData = JSON.stringify(jsonData);

            // Write the updated JSON data back to the file
            fs.writeFile('RegisteredCompanies', updatedJsonData, (err) => {
                if (err) {
                    console.error(err);
                    // Handle error, e.g., send an error response
                    res.sendStatus(500);
                } else {
                    console.log('Data added to list and saved successfully');
                    // Send a success response
                    res.render('Register');
                }
            });
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            // Handle error, e.g., send an error response
            res.sendStatus(500);
        }
    });
});