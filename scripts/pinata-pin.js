//Requires
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require("fs");
const csv = require('csv-parser');
const FormData = require("form-data");
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
const contractAddress = '0x63225FFaB6B5fF75835FA017470ECF0E7f30Bc60' //This has to be deployed smart contract address on the GOERLI testnet
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

const pinImagesToPinata = async () =>
{
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const src = '../Images' + date;

  try {
    const { dirs, files } = await rfs.read(src);
    let data = new FormData();

    for (const file of files) {
      data.append('file', fs.createReadStream(file), {
        filepath: basePathConverter(src, file),
      });
    }

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        Authorization: JWT,
      },
    });

    console.log('Pin image succeeded!', response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (error) {
    console.log('Pin image failed!', error);
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
    return response.data.IpfsHash;
  } catch (error) {
    console.log('Pin metadata failed!', error);
  }
};

const createImages = async (_id) =>
{

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
        // averageEfficiency: Math.random() * 100,
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
    const IPFSURl = "https://gateway.pinata.cloud/ipfs/" + dataFolderCID;
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
  await readCSVFileAndRegisterCompanies();

  //Get the average scores (usage, shared, etc...)
  //await calculateAverageValues();

  //Creating images in the ../imgFolder for each company based on smart contract read values
  // for (let i = 0; i < 100; i++)
  // {
  //   createImages();
  // }

  //Pinning the imgFolder to pinata IPFS
  imgFolderCID = await pinImagesToPinata();

  //Creating metadata in the ../data for each company based on smart contract read values and created images
  //Hardcoded to a for loop of 3 for now
  const promises = [];
  
  for (let i = 1; i <= companyData.length - 1; i++)
  {
    promises.push(createMetadata(i));
  }
  
  try
  {
    await Promise.all(promises);
    console.log('All metadata files created!');
    // Continue with the rest of your code here
  } 
  catch (error)
  {
    console.error('Metadata creation failed!', error);
  }

  //Pinning the metadata to Pinata
  dataFolderCID = await pinMetaDataToPinata();

  //Write here to a CSV file what the CID and ID (for example 202305) is

  //Setting the new CID of the metadata on the smart contract
  setTimeout(() => { updateCIDValueOnSmartContract(); }, 30000);

  //Minting the NFT's for all registered companies
  setTimeout(() => { mintNFTs(); }, 50000);
}

//Calling the main function every month
//const interval = setInterval(mainFunction(), 30 * 24 * 60 * 60 * 1000);
mainFunction();



// function getHSL(uint id) public view returns (uint)
// {
//     //120 for the color. first 1 is for the formule and second 1 is to revert the outcome for example 0.1 should be 0.9
//     return 120 * 1 - (1 - (companies[id].companyEnergyUsage / MAX_ENERGY_EFFICIENCY));
// }