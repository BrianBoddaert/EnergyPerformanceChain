const fs = require("fs");
const csv = require('csv-parser');

const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

const provider = 'https://mainnet.infura.io/v3/fb039c9592f7494092d531602fb06e12';
const https = require('https');
const path = require("path");

let companyData = [];
let CIDdata = [];

async function readCSVFile()
{

  companyData.length = 0;
  CIDdata.length = 0;

  const data = await readFileAsync(path.resolve(__dirname, '..') +'/RegisteredCompanies.json', 'utf8');
  const jsonData = JSON.parse(data);

  // Iterate over each object in the JSON data
  for (const [index, obj] of jsonData.entries())
  {
    const CompanyName = obj.cname;

    companyData.push([index,CompanyName]);
  }

  const streamCID = fs.createReadStream('CIDs.csv')
  .pipe(csv());

  for await (const row of streamCID) {
    const {Date,CID} = row;
    CIDdata.push([Date,CID]);
  }
}

async function LoadLatestMetaData()
{
  var Result = [];
  const JsonsPerPageLimit = 30;
  const year = 2023;
  const month = '05';

  //https://gateway.pinata.cloud/ipfs/QmYyJMvcBfyqACKaeN5SC6UF9bs4zEWc4SD19MHCK1z1eh/
  // "https://blush-worldwide-swift-945.mypinata.cloud/ipfs/" + CID + '/' + date + _id + '.json'

  const len = CIDdata.length - 1;
  const baseUrl = "https://blush-worldwide-swift-945.mypinata.cloud/ipfs/" + CIDdata[len][1] + '/';

  for (let i = 0; i < JsonsPerPageLimit; i++)
  {
    let url = baseUrl + `${i+1}` +  + CIDdata[len][0] + `.json`;
    const JsonWithImage = await isJsonWithImage(url);
    if (!JsonWithImage[0])
    {
      break;
    }

    Result[i] = JsonWithImage[1];
  }

  console.log("Completed pulling Jsons from IPFS!");
  return Result;
}

async function isJsonWithImage(url) 
{
  try {
    const response = await new Promise((resolve, reject) => {
      https.get(url, resolve).on('error', reject);
    });

    const contentType = response.headers['content-type'];
    let jsonData = '';

    if (contentType && contentType.includes('application/json')) {
      const data = await new Promise((resolve, reject) => {
        let json = '';

        response.on('data', chunk => {
          json += chunk;
        });

        response.on('end', () => {
          try {
            jsonData = JSON.parse(json);

            if (jsonData.hasOwnProperty('image')) 
            {
              jsonData.image = 'https://ipfs.io/ipfs/' + jsonData.image.substring(7);
              resolve(jsonData);
            }
            else
            {
              reject('')
            }
          } catch (error) {
            reject('');
          }
        });
      });

      return [true,data];
    } else {
      return [false,''];
    }
  } catch (error) {
    console.error(`Error checking if ${url} is JSON with image property: ${error.message}`);
    return [false,''];
  }
}

async function GetAllJsonsInFolder()
{
  await new Promise((resolve) => { readCSVFile().then(() => { resolve(); }); });

  return LoadLatestMetaData();
}

async function UploadToJson(req, res) {
  return new Promise((resolve, reject) => {
    // Read the existing JSON file
    fs.readFile('RegisteredCompanies.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        // Handle error, e.g., send an error response
        res.sendStatus(500);
        reject(false);
      }
      try {
        // Parse the existing JSON data into a JavaScript object
        const jsonData = JSON.parse(data);

        // Add the req.body data to the desired list in the JavaScript object
        jsonData.push(req.body);

        // Convert the updated JavaScript object back to JSON
        const updatedJsonData = JSON.stringify(jsonData);

        // Write the updated JSON data back to the file
        fs.writeFile('RegisteredCompanies.json', updatedJsonData, (err) => {
          if (err) {
            console.error(err);
            // Handle error, e.g., send an error response
            res.sendStatus(500);
            reject(false);
          } else {
            console.log('Data added to list and saved successfully');
            // Send a success response
            resolve(true);
          }
        });
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        // Handle error, e.g., send an error response
        res.sendStatus(500);
        reject(false);
      }
    });
  });
}

async function UpdateToJson(req, res) 
{
  return new Promise((resolve, reject) => {
    // Read the existing JSON file
    fs.readFile('RegisteredCompanies.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        // Handle error, e.g., send an error response
        res.sendStatus(500);
        reject(false);
      }
      try {
        // Parse the existing JSON data into a JavaScript object
        const jsonData = JSON.parse(data);

        // Find the index of the object with matching "metamaskaddressstorage" value
        const index = jsonData.findIndex(obj => obj.metamaskaddressstorage === req.body.metamaskaddressstorage);

        if (index !== -1) 
        {

          // Merge the existing object with the new req.body object
          const mergedObject = { ...jsonData[index], ...req.body };

          // Replace the object at the found index with the merged object
          jsonData[index] = mergedObject;

          // Convert the updated JavaScript object back to JSON
          const updatedJsonData = JSON.stringify(jsonData);

          // Write the updated JSON data back to the file
          fs.writeFile('RegisteredCompanies.json', updatedJsonData, (err) => {
            if (err) {
              console.error(err);
              // Handle error, e.g., send an error response
              res.sendStatus(500);
              reject(false);
            } else {
              console.log('Object replaced and saved successfully');
              // Send a success response
              resolve(true);
            }
          });
        } else {
          console.log('Object not found');
          // Handle object not found, e.g., send a not found response
          res.sendStatus(404);
          reject(false);
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        // Handle error, e.g., send an error response
        res.sendStatus(500);
        reject(false);
      }
    });
  });
}

function SortCompanyData(data, selectedOption) {
  data.sort(function(a, b) {
    if (selectedOption === 'energyEfficiency') {
      return b.attributes[0].EnergyUsage - a.attributes[0].EnergyUsage;
    } else if (selectedOption === 'energyGreen') {
      return b.attributes[0].EnergyGreen - a.attributes[0].EnergyGreen;
    } else if (selectedOption === 'energySharing') {
      return b.attributes[0].EnergySharing - a.attributes[0].EnergySharing;
    }
  });

  return data;
}

async function IsWalletIDRegistered(address)
{
  const filename = "RegisteredCompanies.json";
  try {
    // Read the JSON file
    const data = fs.readFileSync(filename, 'utf8');
    
    // Parse the JSON data
    const list = JSON.parse(data);
    
    // Check if any object in the list matches the address
    const matchedObject = list.find(obj => obj.metamaskaddressstorage === address);
    // Return the matched object or null if not found
    return matchedObject || null;
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    return null;
  }
}

module.exports = {
  companyData,
  CIDdata,
  GetAllJsonsInFolder,
  UploadToJson,
  UpdateToJson,
  SortCompanyData,
  IsWalletIDRegistered
}