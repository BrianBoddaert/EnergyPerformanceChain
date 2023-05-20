//Requires
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require("fs");
const csv = require('csv-parser');
const FormData = require("form-data");
const Jimp = require('jimp');
const rfs = require("recursive-fs");
const basePathConverter = require("base-path-converter");
const axios = require('axios');
//Pinata details
const JWT = process.env.JWT
//Web3 details
const Web3 = require('web3');
//Using volta testnet
const providerUrl = 'https://volta-rpc.energyweb.org';
const web3 = new Web3(providerUrl);
//Contract details
const contractABI = require('../SmartContracts/EPChain-abi.json'); //Should be updated if we deploy a new, updated smart contract
const { async } = require('recursive-fs/lib/copy');
const contractAddress = '0x7Ce315e5B33E81a7f852ed9aFdfC00788cC17e18' //This has to be deployed smart contract address on the GOERLI testnet
const EPChainContract = new web3.eth.Contract(contractABI, contractAddress);
//Wallet/Account details
const privateKey = process.env.PRIVATE_KEY; //This should be updated if you use a different account/wallet
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
//CID vars
let imgFolderCID = "";
let dataFolderCID = "";
let date = "202305" //set it every time //TODO: set the date on folder names of images and data as well
let companyData = [];
let averageEfficiency = 0;

const pinImagesToPinata = async () =>
{
  const pinataURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const src = '../Images' + date;

  try
  {
    const { dirs, files } = await rfs.read(src);
    let data = new FormData();

    for (const file of files) {
      if (file.endsWith('.png')) {
        data.append('file', fs.createReadStream(file), {
          filepath: basePathConverter(src, file),
      });
      }
    }

    const response = await axios.post(pinataURL, data, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        Authorization: JWT,
      },
    });

    console.log('Pin image succeeded!', response.data.IpfsHash);
    imgFolderCID = response.data.IpfsHash;
  } catch (error) {
    console.log('Pin image failed!');
  }
};

const pinMetaDataToPinata = async () =>
{
  const pinataURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const src = '../Data' + date;

  try {
    const { dirs, files } = await rfs.read(src);
    let data = new FormData();

    for (const file of files) {
      if (file.endsWith('.json')) {
        data.append(`file`, fs.createReadStream(file), {
          filepath: basePathConverter(src, file),
        });
      }
    }

    const response = await axios.post(pinataURL, data, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        'Authorization': JWT,
      },
    });

    console.log('Pin metadata succeeded!', response.data.IpfsHash);
    dataFolderCID = response.data.IpfsHash;
  } catch (error) {
    console.log('Pin metadata failed!', error);
  }
};

const createImage = async (_id) =>
{
  const width = 100;
  const height = 100;
  const maxColor = 255;
  //calculating colors
  const midRange = 0.5;
  const colorVariable = (companyData[_id][1] - averageEfficiency) / (2 * averageEfficiency) + midRange;
  let red = Math.round(maxColor * colorVariable);
  let green = Math.round(maxColor * (1 - colorVariable));
  //clamping the colors between 0 and 255
  red = Math.min(Math.max(red, 0), maxColor);
  green = Math.min(Math.max(green, 0), maxColor);
  
  const image = new Jimp(width, height, (err, image) =>
  {
    if (err) throw err;
  
    image.background(0x00000000); // Set transparent background
  
    const color = Jimp.rgbaToInt(red, green, 0, maxColor);
  
    for (let x = 0; x < width; x++)
    {
      for (let y = 0; y < height; y++)
      {
        image.setPixelColor(color, x, y);
      }
    }
  
    const savePath = path.resolve('../Images' + date, date + _id + '.png');
    image.write(savePath, (err) =>
    {
      if (err) throw err;
      console.log(`Image created successfully at ${savePath}!`);
    });
  });
}

const createMetadata = async (_id) => {
  // Define the metadata entries
  const metadata = {
    name: "companyName",
    description: "givenDescription",
    image: "ipfs://" + imgFolderCID + "/" + date + _id + ".png",
    attributes: [
      {
        energyEfficiency: companyData[_id][1],
        // energyGreen: Math.random() * 100,
        // energySharing: Math.random() * 100,
        averageEfficiency: averageEfficiency,
        // averageGreen: Math.random() * 100,
        // averageSharing: Math.random() * 100,
      }
    ]
  };

  // Convert the metadata object to a JSON string
  const metadataJson = JSON.stringify(metadata);

  // Define the file path and name
  const filePath = '../Data' + date + '/' + date + _id + '.json';

  return new Promise((resolve, reject) => {
    // Write the metadata JSON to a file
    fs.writeFile(filePath, metadataJson, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Metadata file created in ${filePath}!`);
        resolve();
      }
    });
  });
};

const readCSVFileAndRegisterCompanies = async () =>
{
  //Pushing one here for the ignored 0 index so we start from 1 in the for loop
  companyData.length = 0;
  companyData.push([ 0, 0, "0x0" ]);

  const stream = fs.createReadStream('../CompanyInfo.csv')
    .pipe(csv());

  for await (const row of stream) {
    const { ID, Value, Address } = row;
    companyData.push([ID, Value, Address]);

    await new Promise((resolve, reject) => {
      EPChainContract.methods.registerCompany(ID, Address).send({
        from: '0x972B4B46e0baBb59fE2cA41ef3D6aBFA2741623d',
        gas: 3000000,
      })
      .on('receipt', (receipt) => {
        // Transaction completed successfully
        resolve(receipt);
      })
      .on('error', (error) => {
        // Transaction failed
        reject(error);
      });
    });
  }

  console.log('CSV file processed');
};

const calculateAverageValues = async () =>
{
  let sum = 0;
  for (let i = 1; i <= companyData.length - 1; i++)
  {
    sum += parseInt(companyData[i][1]);
  }
  averageEfficiency = sum / (companyData.length - 1)
}

const mintNFTs = async () =>
{
  return new Promise((resolve, reject) =>
  {
    EPChainContract.methods.mintForRegisteredCompanies(date).send({
      from: '0x972B4B46e0baBb59fE2cA41ef3D6aBFA2741623d',
      gas: 4000000,
      gasPrice: '5000000000',
    })
      .on('receipt', (receipt) => {
        console.log('Mint NFTs succeeded!');
        resolve(receipt);
      })
      .on('error', (error) => {
        console.log('Mint NFTs failed!', error);
        reject(error);
      });
  });
};

const updateCIDValueOnSmartContract = async () =>
{
  return new Promise((resolve, reject) =>
  {
    const IPFSURl = "https://blush-worldwide-swift-945.mypinata.cloud/ipfs/" + dataFolderCID;
    console.log(IPFSURl);
    EPChainContract.methods.setBaseURL(IPFSURl).send({
      from: '0x972B4B46e0baBb59fE2cA41ef3D6aBFA2741623d',
      gas: 3000000,
    })
      .on('receipt', (receipt) => {
        console.log('Update CID value succeeded!');
        resolve(receipt);
      })
      .on('error', (error) => {
        console.log('Update CID value failed!', error);
        reject(error);
      });
  });
};


const mainFunction = async () =>
{
  //Reading the CompanyInfo.csv file and registering/updating the companies to the smart contract
  await new Promise((resolve) => { readCSVFileAndRegisterCompanies().then(() => { resolve(); }); });
  
  //Get the average scores (usage, shared, etc...)
  await new Promise((resolve) => { calculateAverageValues().then(() => { resolve(); }); });

  //Creating images in the ../imgFolder for each company based on smart contract read values
  const imagePromises = [];
  
  for (let i = 1; i <= companyData.length - 1; i++)
  {
    imagePromises.push(createImage(i));
  }
  
  try
  {
    await Promise.all(imagePromises);
    console.log('All images files created!');
    
    //Pinning the imgFolder to pinata IPFS
    await new Promise((resolve) => { setTimeout(async () => { await pinImagesToPinata(); resolve(); }, 1000);});

    //Creating metadata in the ../data for each company based on smart contract read values and created images
    const metadataPromises = [];
    
    for (let i = 1; i <= companyData.length - 1; i++)
    {
      metadataPromises.push(createMetadata(i));
    }
    
    try
    {
      await Promise.all(metadataPromises);
      console.log('All metadata files created!');

      //Pinning the metadata to Pinata
      await new Promise((resolve) => { setTimeout(async () => { await pinMetaDataToPinata(); resolve(); }, 1000);});

      //Write here to a CSV file what the CID and ID (for example 202305) is//maybe not needed, we can track each individuals metadata using their nft that can be tracked from smart contract
    
      //Setting the new CID of the metadata on the smart contract
      await new Promise((resolve) => { setTimeout(async () => { await updateCIDValueOnSmartContract(); resolve(); }, 3000);});
    
      //Minting the NFT's for all registered companies
      await new Promise((resolve) => { setTimeout(async () => { await mintNFTs(); resolve(); }, 10000);});
    } 
    catch (error)
    {
      console.error('Metadata creation failed!', error);
    }
  } 
  catch (error)
  {
    console.error('Image creation failed!', error);
  }
}

//Calling the main function every month
//const interval = setInterval(mainFunction(), 30 * 24 * 60 * 60 * 1000);
mainFunction();