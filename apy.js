import fetch from "node-fetch";
//const provider = process.env.INFURA_URL;

const provider = 'https://mainnet.infura.io/v3/fb039c9592f7494092d531602fb06e12';
const https = require('https');

async function GetAllJsonsInFolder()
{
  var Result = [];
  const JsonsPerPageLimit = 30;
  const baseUrl = "https://gateway.pinata.cloud/ipfs/QmdfesFXsAZpS7hSvYUMM1dVQbqTYxK2g4iz35JbPcAyQ8"; //1.json

  console.log("Started pulling Jsons from IPFS...");

  for (let i = 0; i < JsonsPerPageLimit; i++)
  {
    console.log("checking iteration " + i);
    let url = baseUrl + `/${i+1}.json`;

    const JsonWithImage = await isJsonWithImage(url);
    if (!JsonWithImage[0])
    {
      break;
    }

    Result[i] = JsonWithImage[1];
    console.log(Result[i]);
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
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      });

      if (data.hasOwnProperty('image')) 
      {
        jsonData.image = 'https://ipfs.io/ipfs/' + json.image.substring(7);
        return [true,jsonData];
      } else {
        return [false,''];
      }
    } else {
      return [false,''];
    }
  } catch (error) {
    console.error(`Error checking if ${url} is JSON with image property: ${error.message}`);
    return [false,''];
  }

}

async function GetJsonFromURL(url)
{
    // const testString = '{ "name":"SampleProj #1", "description":"These are my sampleproj pictures", "image":"ipfs://QmXhbZLVCsjdKaCz5Cw7kot3P3unBawrbzUPLcULrimamQ/1.png","attributes": [ {"trait_type":"Color","value":"Black&White"},{"trait_type":"Background","value":"Clouds"}],"external_url":""}';
    // const json = JSON.parse(testString);
    // json.image = 'https://ipfs.io/ipfs/' + json.image.substring(7);

    
    // return json;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
          let data = '';
    
          response.on('data', (chunk) => {
            data += chunk;
          });
    
          response.on('end', () => {
            try {
              const testString = '{ "name":"SampleProj #1", "description":"These are my sampleproj pictures", "image":"ipfs://QmXhbZLVCsjdKaCz5Cw7kot3P3unBawrbzUPLcULrimamQ/1.png","attributes": [ {"trait_type":"Color","value":"Black&White"},{"trait_type":"Background","value":"Clouds"}],"external_url":""}';
              const json = JSON.parse(data);
              json.image = 'https://ipfs.io/ipfs/' + json.image.substring(7);
              resolve(json);
            } catch (error) {
              reject(error);
            }
          });
        }).on('error', (error) => {
          reject(error);
        });
      });

}


export default GetAllJsonsInFolder