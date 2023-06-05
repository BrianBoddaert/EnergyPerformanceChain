const fs = require("fs");
const csv = require('csv-parser');

const provider = 'https://mainnet.infura.io/v3/fb039c9592f7494092d531602fb06e12';
const https = require('https');

const companyData = [];
const CIDdata = [];

const readCSVFile = async () =>
{
  companyData.length = 0;

  const stream = fs.createReadStream('CompanyInfo.csv')
    .pipe(csv());

  for await (const row of stream) {
    const {ID,UsageValue,GreenValue,SharingValue,Address,CompanyName} = row;
    companyData.push([ID,CompanyName]);
  }

  const streamCID = fs.createReadStream('CIDs.csv')
    .pipe(csv());

  for await (const row of streamCID) {
    const {Date,CID} = row;
    CIDdata.push([Date,CID]);
  }
};

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

async function GetRegisteredCompanies()
{

}

module.exports = {
  companyData,
  CIDdata,
  GetAllJsonsInFolder,
  SortCompanyData
}