import fetch from "node-fetch";
//const provider = process.env.INFURA_URL;

const provider = 'https://mainnet.infura.io/v3/fb039c9592f7494092d531602fb06e12';
const https = require('https');

async function GetAllJsonsInFolder()
{
  var Result = [];

  const baseUrl = "https://gateway.pinata.cloud/ipfs/QmdfesFXsAZpS7hSvYUMM1dVQbqTYxK2g4iz35JbPcAyQ8"; //1.json

  let i = 1;
  let url = baseUrl + `/${i}.json`;

  for (let j = 0; j < 3; j++)
  {
    if (!(await isJsonWithImage(url)))
    {
     break;
    }

    Result[i-1] = await GetJsonFromURL(url);
    console.log(Result[i-1]);
    i++;
    url = baseUrl + `/${i}.json`;

    
  }
  // while (isJsonWithImage(url)) 
  // { 
  //   Result[i-1] = GetJsonFromURL(url);
  //   i++;
  //   url = baseUrl + `/${i}.json`;
  // }
  // for (let j = 0; j < 3; j++)
  // {
  //   Result[j] = await GetJsonFromURL(baseUrl);
  // }

  return Result;
}

async function isJsonWithImage(url) 
{
  try {
    const response = await new Promise((resolve, reject) => {
      https.get(url, resolve).on('error', reject);
    });

    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      const data = await new Promise((resolve, reject) => {
        let json = '';

        response.on('data', chunk => {
          json += chunk;
        });

        response.on('end', () => {
          try {
            const jsonData = JSON.parse(json);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      });

      if (data.hasOwnProperty('image')) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error checking if ${url} is JSON with image property: ${error.message}`);
    return false;
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