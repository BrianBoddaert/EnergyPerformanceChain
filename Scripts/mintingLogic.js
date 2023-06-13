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
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const lerpColor = require('color-rgba').lerpColor;

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
const contractAddress = '0xcA78c5C7aD982D26f110A2784fCfE8F161E123A3' //This has to be deployed smart contract address on the GOERLI testnet
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
  let formattedDate = `${year}${formattedMonth}`;
  console.log(formattedDate);
  date = formattedDate;
}

const readJSONFileAndRegisterCompanies = async () => {
  try {
    // Pushing one here for the ignored 0 index so we start from 1 in the for loop
    companyData.length = 0;
    companyData.push([0, 0, "0x0"]);

    // Read the JSON file
    const data = await readFileAsync('../RegisteredCompanies.json', 'utf8');
    const jsonData = JSON.parse(data);

    // Iterate over each object in the JSON data
    for (const [index, obj] of jsonData.entries())
    {
      const ID = index + 1;
      const Address = obj.metamaskaddressstorage;

      await new Promise((resolve, reject) => {
        EPChainContract.methods.registerCompany(ID, Address).send({
          from: '0x972B4B46e0baBb59fE2cA41ef3D6aBFA2741623d',
          gas: 3000000,
        })
          .on('receipt', (receipt) => {
            // Transaction completed successfully
            const UsageValue = obj.energyspent;
            const GreenValue = obj.energygreen;
            const SharingValue = obj.energyshared;
            const CompanyName = obj.cname;
            const Description = obj.description;

            // Push the data to the companyData array
            companyData.push([ID, UsageValue, GreenValue, SharingValue, Address, CompanyName, Description]);
            resolve(receipt);
          })
          .on('error', (error) => {
            // Transaction failed
            reject(error);
          });
      });
    }

    console.log('JSON file processed');
  } catch (error) {
    console.error(error);
  }
};

const calculateAverageValues = async () =>
{
  let usageSum = 0;
  let greenSum = 0;
  let sharingSum = 0;
  
  let amountOfCompaniesGreen = 0;
  let amountOfCompaniesSharing = 0;

  for (let i = 1; i <= companyData.length - 1; i++)
  {
    usageSum += parseInt(companyData[i][1]);
    
    if (parseInt(companyData[i][2]) > 0) 
    {
      greenSum += parseInt(companyData[i][2]);
      amountOfCompaniesGreen++;
    }

    if (parseInt(companyData[i][3]) > 0) 
    {
      sharingSum += parseInt(companyData[i][3]);
      amountOfCompaniesSharing++;
    }
  }
  averageUsage = usageSum / (companyData.length - 1);
  averageGreen = greenSum / amountOfCompaniesGreen;
  averageSharing = sharingSum / amountOfCompaniesSharing;
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

function lerpColorFunction(color1, color2, ratio)
{
  const r = Math.round(clamp(lerp(color1.r, color2.r, ratio), 0, 255));
  const g = Math.round(clamp(lerp(color1.g, color2.g, ratio), 0, 255));
  const b = Math.round(clamp(lerp(color1.b, color2.b, ratio), 0, 255));
  return `rgb(${r},${g},${b})`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
    
function lerp(value1, value2, ratio)
{
  return value1 * (1 - ratio) + value2 * ratio;
}

const createImage = async (_id) =>
{
  const midRange = 0.5;
  let colorVariable1 = 0, colorVariable2 = 0, colorVariable3 = 0, totalSections = 0;

  if (companyData[_id][1] > 0)
  {
    colorVariable1 = 1 - ((companyData[_id][1] - averageUsage) / (2 * averageUsage) + midRange);
    totalSections++;
  }
  if (companyData[_id][2] > 0)
  {
    colorVariable2 = ((companyData[_id][2] - averageGreen) / (2 * averageGreen) + midRange);
    totalSections++;
  }
  if (companyData[_id][3] > 0)
  {
    colorVariable3 = ((companyData[_id][3] - averageSharing) / (2 * averageSharing) + midRange);
    totalSections++;
  }

  const imageSize = 1000; // Size of the image in pixels
  const radius = imageSize / 2;
  const anglePerPart = (2 * Math.PI) / totalSections;

  // Calculate the start and end angles for each part
  let startAngle1 = 0, endAngle1 = 0, startAngle2 = 0, endAngle2 = 0, startAngle3 = 0, endAngle3 = 0;
  
  if (totalSections == 2)
  {
    startAngle1 = -(Math.PI / 2);
    endAngle1 = anglePerPart + -(Math.PI / 2);
    startAngle2 = anglePerPart + -(Math.PI / 2);
    endAngle2 = 2 * Math.PI + -(Math.PI / 2);
  }
  else
  {
    startAngle1 = 0;
    endAngle1 = anglePerPart;
    startAngle2 = anglePerPart;
    endAngle2 = 2 * anglePerPart;
    startAngle3 = 2 * anglePerPart;
    endAngle3 = 2 * Math.PI;
  }

  // Define the start and end colors
  const startColor = { r: 230, g: 71, b: 57 };
  const endColor = { r: 76, g: 188, b: 91 };

  // Calculate the lerped colors
  let color1 = 0, color2 = 0, color3 = 0;
  
  if (colorVariable1 != 0) color1 = lerpColorFunction(startColor, endColor, colorVariable1);
  if (colorVariable2 != 0) color2 = lerpColorFunction(startColor, endColor, colorVariable2);
  if (colorVariable3 != 0) color3 = lerpColorFunction(startColor, endColor, colorVariable3);

  // Create a new blank image with a transparent background
  const image = sharp({
    create: {
      width: imageSize,
      height: imageSize,
      channels: 4, // Set channels to 4 for RGBA (including alpha channel)
      background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
    }
  });

  // Paths to the base image and overlay image
  let overlayImagePath = '';
  
  // Draw each part of the circle with the corresponding color
  if (totalSections == 1)
  {
    overlayImagePath = '../NFTOverlay1.png';
    image.composite
    ([
      {
        input: Buffer.from( `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
        <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${color1}" />
      </svg>`),
        left: 0,
        top: 0
      },
    ]);
  }
  else if (totalSections == 2)
  {
    let secondColor = 0;

    if (color1 != 0 && color2 != 0)
    {
      overlayImagePath = '../NFTOverlay2-Usage&Green.png';
      secondColor = color2;
    }
    else
    {
      overlayImagePath = '../NFTOverlay2-Usage&Sharing.png';
      secondColor = color3;
    }

    image.composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle1) * radius + radius},${Math.sin(startAngle1) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle1) * radius + radius},${Math.sin(endAngle1) * radius + radius} Z" fill="${secondColor}" />
          </svg>`
        ),
        left: 0,
        top: 0
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle2) * radius + radius},${Math.sin(startAngle2) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle2) * radius + radius},${Math.sin(endAngle2) * radius + radius} Z" fill="${color1}" />
          </svg>`
        ),
        left: 0,
        top: 0
      },
    ]);
  }
  else
  {
    overlayImagePath = '../NFTOverlay3.png';

    image.composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle1) * radius + radius},${Math.sin(startAngle1) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle1) * radius + radius},${Math.sin(endAngle1) * radius + radius} Z" fill="${color3}" />
          </svg>`
        ),
        left: 0,
        top: 0
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle2) * radius + radius},${Math.sin(startAngle2) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle2) * radius + radius},${Math.sin(endAngle2) * radius + radius} Z" fill="${color1}" />
          </svg>`
        ),
        left: 0,
        top: 0
      },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}">
            <path d="M ${radius},${radius} L ${Math.cos(startAngle3) * radius + radius},${Math.sin(startAngle3) * radius + radius} A ${radius},${radius} 0 0 1 ${Math.cos(endAngle3) * radius + radius},${Math.sin(endAngle3) * radius + radius} Z" fill="${color2}" />
          </svg>`
        ),
        left: 0,
        top: 0
      }
    ]);
  }

  // Save the image to a file with a transparent background
  const outputPath = path.join(__dirname, '../' + imageFolder, _id + date + '.png');
  await image.png().toFile(outputPath);

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
    description: companyData[_id][6],
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

  //Reading the RegisteredCompanies.json file and registering/updating the companies to the smart contract
  await new Promise((resolve) => { readJSONFileAndRegisterCompanies().then(() => { resolve(); }); });
  
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