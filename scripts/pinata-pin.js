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
const sharp = require('sharp');
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
const contractAddress = '0x3C8F63Ef7C4E815352C6a1121DA044d877c0E778' //This has to be deployed smart contract address on the GOERLI testnet
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
let averageUsage = 0;
let averageGreen = 0;
let averageSharing = 0;

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
  const midRange = 0.5;
  const colorVariable1 = 1 - ((companyData[_id][1] - averageUsage) / (2 * averageUsage) + midRange);
  const colorVariable2 = 1 - ((companyData[_id][2] - averageGreen) / (2 * averageGreen) + midRange);
  const colorVariable3 = 1 - ((companyData[_id][3] - averageSharing) / (2 * averageSharing) + midRange);
  
  const imageSize = 200; // Size of the image in pixels
  const radius = imageSize / 2;
  const anglePerPart = (2 * Math.PI) / 3;

  // Calculate the start and end angles for each part
  const startAngle1 = 0;
  const endAngle1 = anglePerPart;
  const startAngle2 = anglePerPart;
  const endAngle2 = 2 * anglePerPart;
  const startAngle3 = 2 * anglePerPart;
  const endAngle3 = 2 * Math.PI;

  // Calculate the RGB color values based on the input values
  const color1 = `rgb(${Math.round((1 - colorVariable1) * 255)}, ${Math.round(colorVariable1 * 255)}, 0)`;
  const color2 = `rgb(${Math.round((1 - colorVariable2) * 255)}, ${Math.round(colorVariable2 * 255)}, 0)`;
  const color3 = `rgb(${Math.round((1 - colorVariable3) * 255)}, ${Math.round(colorVariable3 * 255)}, 0)`;

  // Create a new blank image with a white background
  const image = sharp({
    create: {
      width: imageSize,
      height: imageSize,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  });

  // Draw each part of the circle with the corresponding color
  image
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle1) * radius + radius},${Math.sin(startAngle1) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle1) * radius + radius},${Math.sin(endAngle1) * radius + radius} Z" fill="${color1}" />
          </svg>`
        ),
        left: 0,
        top: 0
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle2) * radius + radius},${Math.sin(startAngle2) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle2) * radius + radius},${Math.sin(endAngle2) * radius + radius} Z" fill="${color2}" />
          </svg>`
        ),
        left: 0,
        top: 0
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle3) * radius + radius},${Math.sin(startAngle3) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle3) * radius + radius},${Math.sin(endAngle3) * radius + radius} Z" fill="${color3}" />
          </svg>`
        ),
        left: 0,
        top: 0
      }
    ])
    .png();

  // Save the image to a file
  const outputPath = path.join(__dirname, '../Images' + date, date + _id + '.png');
  await image.toFile(outputPath); 
}

const createMetadata = async (_id) => {
  // Define the metadata entries
  const metadata = {
    name: "companyName",
    description: "givenDescription",
    image: "ipfs://" + imgFolderCID + "/" + date + _id + ".png",
    attributes: [
      {
        EnergyUsage: companyData[_id][1],
        EnergyGreen: companyData[_id][2],
        EnergySharing: companyData[_id][3],
        AverageUsage: averageUsage.toFixed(2),
        AverageGreen: averageGreen.toFixed(2),
        AverageSharing: averageSharing.toFixed(2),
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
    const { ID, UsageValue, GreenValue, SharingValue, Address } = row;
    companyData.push([ID, UsageValue, GreenValue, SharingValue, Address]);

    await new Promise((resolve, reject) => {
      EPChainContract.methods.registerCompany(ID, Address).send({
        from: '0xDFD27C5c9b8F9a86bc1B0e887F58A4f3ABA6391c',
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
  let usageSum = 0;
  let greenSum = 0;
  let sharingSum = 0;
  for (let i = 1; i <= companyData.length - 1; i++)
  {
    usageSum += parseInt(companyData[i][1]);
    greenSum += parseInt(companyData[i][2]);
    sharingSum += parseInt(companyData[i][3]);
  }
  averageUsage = usageSum / (companyData.length - 1)
  averageGreen = greenSum / (companyData.length - 1)
  averageSharing = sharingSum / (companyData.length - 1)

}

const mintNFTs = async () =>
{
  return new Promise((resolve, reject) =>
  {
    EPChainContract.methods.mintForRegisteredCompanies(date).send({
      from: '0xDFD27C5c9b8F9a86bc1B0e887F58A4f3ABA6391c',
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
      from: '0xDFD27C5c9b8F9a86bc1B0e887F58A4f3ABA6391c',
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