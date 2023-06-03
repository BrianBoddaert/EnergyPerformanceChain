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
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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
const contractAddress = '0x6da475A2c1f098f996A4fB64bC57d9eA50Ea1064' //This has to be deployed smart contract address on the GOERLI testnet
const EPChainContract = new web3.eth.Contract(contractABI, contractAddress);
//Wallet/Account details
const privateKey = process.env.PRIVATE_KEY; //This should be updated if you use a different account/wallet
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
//CID vars
let imgFolderCID = "";
let dataFolderCID = "";
let date = "";
let companyData = [];
let averageUsage = 0;
let averageGreen = 0;
let averageSharing = 0;
let imageFolder = '';
let dataFolder = '';

const updateCurrentDate = async () =>
{
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; //Adding one coz months are zero-based
  
  //Adding 0 to the front of single digit months
  const formattedMonth = month < 10 ? `0${month}` : month;
  
  const formattedDate = `${year}${formattedMonth}`;
  console.log(formattedDate);
  date = formattedDate;
}

const readCSVFileAndRegisterCompanies = async () =>
{
  //Pushing one here for the ignored 0 index so we start from 1 in the for loop
  companyData.length = 0;
  companyData.push([ 0, 0, "0x0" ]);

  const stream = fs.createReadStream('../CompanyInfo.csv')
    .pipe(csv());

  for await (const row of stream) {
    const { ID, UsageValue, GreenValue, SharingValue, Address, CompanyName } = row;
    companyData.push([ID, UsageValue, GreenValue, SharingValue, Address, CompanyName]);

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

const createFolders = async () =>
{
  imageFolder =  'Images' + date;
  let folderPath = path.join(__dirname, '../', imageFolder);

  fs.mkdir(folderPath, { recursive: true }, (err) =>
  {
    if (err)
    {
      console.error('An error occurred while creating the images folder:', err);
    }
    else
    {
      console.log('Images folder created successfully!');
    }
  });

  dataFolder =  'Data' + date;
  folderPath = path.join(__dirname, '../', dataFolder);

  fs.mkdir(folderPath, { recursive: true }, (err) =>
  {
    if (err)
    {
      console.error('An error occurred while creating the data folder:', err);
    }
    else
    {
      console.log('Data folder created successfully!');
    }
  });
}

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
  const color1 = `rgba(${Math.round((1 - colorVariable1) * 255)}, ${Math.round(colorVariable1 * 255)}, 0, 1)`;
  const color2 = `rgba(${Math.round((1 - colorVariable2) * 255)}, ${Math.round(colorVariable2 * 255)}, 0, 1)`;
  const color3 = `rgba(${Math.round((1 - colorVariable3) * 255)}, ${Math.round(colorVariable3 * 255)}, 0, 1)`;

  // Create a new blank image with a transparent background
  const image = sharp({
    create: {
      width: imageSize,
      height: imageSize,
      channels: 4, // Set channels to 4 for RGBA (including alpha channel)
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    }
  });

  // Draw each part of the circle with the corresponding color
  image.composite([
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
  ]);

  // Save the image to a file with a transparent background
  const outputPath = path.join(__dirname, '../' + imageFolder, _id + date + '.png');
  await image.png().toFile(outputPath);

  // Paths to the base image and overlay image
  const overlayImagePath = '../NFTOverlay.png';

  // Load the base image
  Jimp.read(outputPath)
    .then(baseImage => {
      // Load the overlay image
      Jimp.read(overlayImagePath)
        .then(overlayImage => {
          // Resize the overlay image to fit the base image
          overlayImage.resize(baseImage.getWidth(), baseImage.getHeight());

          // Compose the images with overlay
          baseImage.composite(overlayImage, 0, 0, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
          });

          // Save the resulting image
          baseImage.write(outputPath);
          console.log('Overlay added successfully!');
        })
        .catch(err => {
          console.error('Error reading overlay image:', err);
        });
    })
    .catch(err => {
      console.error('Error reading base image:', err);
    });
};

const pinImagesToPinata = async () =>
{
  const pinataURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const src = '../' + imageFolder;

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

const createMetadata = async (_id) => {
  // Define the metadata entries
  const metadata = {
    name: companyData[_id][5],
    description: "givenDescription",
    image: "ipfs://" + imgFolderCID + "/" + _id + date + ".png",
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
  const filePath = '../' + dataFolder + '/' + _id + date + '.json';

  return new Promise((resolve, reject) =>
  {
    // Write the metadata JSON to a file
    fs.writeFile(filePath, metadataJson, (err) =>
    {
      if (err)
      {
        reject(err);
      }
      else
      {
        resolve();
      }
    });
  });
};

const pinMetaDataToPinata = async () =>
{
  const pinataURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const src = '../' + dataFolder;

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
    addNewRow(date, dataFolderCID);
  } catch (error) {
    console.log('Pin metadata failed!', error);
  }
};

async function addNewRow(date, cid)
{
  // Define the CSV file path and headers
  const csvHeaders =
  [
    { id: 'Date', title: 'Date' },
    { id: 'CID', title: 'CID' }
  ];

  const csvWriter = createCsvWriter
  ({
    path: '../CIDs.csv',
    header: csvHeaders,
    append: true
  });

  const newRecord =
  [
    { Date: date, CID: cid }
  ];

  await csvWriter.writeRecords(newRecord);
  console.log('New CID row added successfully.');
}

const mintNFTs = async () =>
{
  const IPFSURl = "https://blush-worldwide-swift-945.mypinata.cloud/ipfs/" + dataFolderCID;

  return new Promise((resolve, reject) =>
  {
    EPChainContract.methods.mintForRegisteredCompanies(date, IPFSURl).send({
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

const deleteFolders = async () =>
{

  let folderPath = '../' + imageFolder;

  fs.rm(folderPath, { recursive: true }, (error) =>
  {
    if (error)
    {
      console.error('Error deleting images folder:', error);
    }
    else
    {
      console.log('Images folder deleted successfully.');
    }
  });

  folderPath = '../' + dataFolder;

  fs.rm(folderPath, { recursive: true }, (error) =>
  {
    if (error)
    {
      console.error('Error deleting data folder:', error);
    }
    else
    {
      console.log('Data folder deleted successfully.');
    }
  });

}

const mainFunction = async () =>
{
  //Set Date
  await new Promise((resolve) => { updateCurrentDate().then(() => { resolve(); }); });

  //Reading the CompanyInfo.csv file and registering/updating the companies to the smart contract
  await new Promise((resolve) => { readCSVFileAndRegisterCompanies().then(() => { resolve(); }); });
  
  //Get the average scores (usage, shared, etc...)
  await new Promise((resolve) => { calculateAverageValues().then(() => { resolve(); }); });

  //Creating images in the ../imgFolder for each company based on smart contract read values
  const imagePromises = [];

  //Created folders for both images and data (metadata)
  await new Promise((resolve) => { createFolders().then(() => { resolve(); }); });
  
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
    
      //Minting the NFT's for all registered companies
      await new Promise((resolve) => { setTimeout(async () => { await mintNFTs(); resolve(); }, 10000);});

      //Deleting folders after minting (all the needed information is on IPFS/Smart contract)
      await new Promise((resolve) => { deleteFolders().then(() => { resolve(); }); });
      
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