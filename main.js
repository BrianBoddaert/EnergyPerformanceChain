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

app.get('/update', async (req, res) => {
    res.render('Update');
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

app.post('/update', urlencodedParser, function (req, res) {
    // Read the existing JSON file
   // updateObjectByCName();
});

// function updateObjectByCName(s, updatedData, callback) {
//     // Read the existing JSON file
//     fs.readFile('data.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error(err);
//             // Handle error, e.g., call the callback with an error
//             callback(err);
//             return;
//         }

//         try {
//             // Parse the existing JSON data into a JavaScript array
//             const jsonData = JSON.parse(data);

//             // Find the object with matching cname
//             const matchingObject = jsonData.find(obj => obj.cname === s);

//             if (matchingObject) {
//                 // Update the matching object
//                 Object.assign(matchingObject, updatedData);

//                 // Convert the updated JavaScript array back to JSON
//                 const updatedJsonData = JSON.stringify(jsonData);

//                 // Write the updated JSON data back to the file
//                 fs.writeFile('data.json', updatedJsonData, (err) => {
//                     if (err) {
//                         console.error(err);
//                         // Handle error, e.g., call the callback with an error
//                         callback(err);
//                     } else {
//                         console.log('Data updated and saved successfully');
//                         // Call the callback indicating success
//                         callback(null);
//                     }
//                 });
//             } else {
//                 console.log('No object with matching cname found');
//                 // Call the callback indicating no matching object found
//                 callback(null);
//             }
//         } catch (error) {
//             console.error('Failed to parse JSON:', error);
//             // Handle error, e.g., call the callback with an error
//             callback(error);
//         }
//     });
// }