import fetch from "node-fetch";
import Compound from '@compound-finance/compound-js';
//const provider = process.env.INFURA_URL;

const provider = 'https://mainnet.infura.io/v3/fb039c9592f7494092d531602fb06e12';
const comptroller = Compound.util.getAddress(Compound.Comptroller);
const opf = Compound.util.getAddress(Compound.PriceFeed);
const cTokenDecimals = 8;
const blocksPerDay = 4 * 60 * 24;
const daysPerYear = 365;
const ethMentissa = Math.pow(10,18);
const https = require('https');

async function calculateSupplyApy(cToken)
{
    const supplyRatePerBlock = await Compound.eth.read
    (
        cToken,
        'function supplyRatePerBlock() returns(uint)',
        [],
        {provider}
    );


    
    return 100 * (Math.pow((supplyRatePerBlock / ethMentissa * blocksPerDay) + 1, daysPerYear - 1) - 1);
}



async function calculateCompApy(cToken, ticker, underlyingDecimals)
{
    // Amount of comp tokens given to lenders and borrows for this block
    let compSpeed = await Compound.eth.read
    (
        comptroller,
        'function compSupplySpeeds(address cToken) public returns (uint)',
        [cToken],
        {provider}
    );

    // Price of the comptoken
    let compPrice = await Compound.eth.read
    (
        opf,
        'function price(string memory symbol) external view returns(uint)',
        [Compound.COMP],
        {provider}
    );

    // Price of the token being borrowed / lended (not the ctoken)
    let underlyingPrice = await Compound.eth.read
    (
        opf,
        'function price(string memory symbol) external view returns(uint)',
        [ticker],
        {provider}
    );

    // The total amount of the ctokens
    let totalSupply = await Compound.eth.read
    (
        cToken,
        'function totalSupply() public view returns(uint)',
        [],
        {provider}
    );

    // Exchange rate between the ctoken and underlying token
    let exchangeRate = await Compound.eth.read
    (
        cToken,
        'function exchangeRateCurrent() public returns(uint)',
        [],
        {provider}
    );

    compSpeed = compSpeed / 1e18;

    compPrice = compPrice / 1e6;
    underlyingPrice = underlyingPrice / 1e6;
    exchangeRate = +exchangeRate.toString() / ethMentissa;
    totalSupply = +totalSupply.toString() * exchangeRate * underlyingPrice / Math.pow(10, underlyingDecimals);
    const compPerDay = compSpeed * blocksPerDay;

    return 100 * (compPrice * compPerDay / totalSupply) * daysPerYear; 

}

async function calculateApy(cTokenTicker, underlyingTicker)
{
    const underlyingDecimals = Compound.decimals[cTokenTicker.slice(1, 10)];
    const cTokenAddress = Compound.util.getAddress(cTokenTicker);
    const [supplyApy, compApy] = await Promise.all
    ([
      calculateSupplyApy(cTokenAddress),
      calculateCompApy(cTokenAddress, underlyingTicker, underlyingDecimals)  
    ]);
    
    return {ticker:underlyingTicker, supplyApy, compApy};
}

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

//export default calculateApy
export default GetAllJsonsInFolder