import fetch from "node-fetch";
//const provider = process.env.INFURA_URL;

const provider = 'https://mainnet.infura.io/v3/fb039c9592f7494092d531602fb06e12';
const https = require('https');

async function GetAllJsonsInFolder()
{
    var Result = [];

    // const baseUrl = "https://gateway.pinata.cloud/ipfs/QmdfesFXsAZpS7hSvYUMM1dVQbqTYxK2g4iz35JbPcAyQ8"; //1.json

    // let i = 1;
    // let url = baseUrl + `/${i}.json`;

    // //Result[i-1] = await GetJsonFromURL(url);

    // while (isUrlJson(url)) 
    // {
    //    Result[i-1] = await GetJsonFromURL(url);
    //    i++;
    //    url = baseUrl + `/${i}.json`;
    // }

    return Result;
}

async function isUrlJson(url) 
{
    try 
    {
        
      const response = await https.get(url);
      const contentType = response.headers['content-type'];
      if (contentType.includes('application/json')) {
        return true;
      } else {
        return false;
      }
    } 
    catch (error) 
    {
      console.log(`Error checking URL ${url}: ${error}`);
      return false;
    }

}

async function GetJsonFromURL(url)
{
    // return new Promise((resolve, reject) => {
    //     https.get(url, (response) => {
    //       let data = '';
    
    //       response.on('data', (chunk) => {
    //         data += chunk;
    //       });
    
    //       // response.on('end', () => {
    //       //   try {
    //       //     // const json = JSON.parse(data);
    //       //     // json.image = 'https://ipfs.io/ipfs/' + json.image.substring(7);
    //       //     resolve();
    //       //   } catch (error) {
    //       //     reject(error);
    //       //   }
    //       // });
    //     }).on('error', (error) => {
    //       reject(error);
    //     });
    //   });

}


export default GetAllJsonsInFolder