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
const contractAddress = '0x5ebEcAb5eE912D9f96f8DdfFe20e7b34AF7D1136' //This has to be deployed smart contract address on the GOERLI testnet
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

    console.log('Pin image succeeded!'); // This logs the CID key
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

    console.log('Pin metadata succeeded!');
    return response.data.IpfsHash;
  } catch (error) {
    console.log('Pin metadata failed!', error);
  }
};

const createImages = async (_id) =>
{

}

const createMetadata = async (_id) =>
{
  // Define the metadata entries
  const metadata = {
    name: "companyName",
    description: "givenDescription",
    image: "ipfs://" + imgFolderCID + "/" + date + _id + ".png",
    attributes: [
      {
        energyEfficiency: "givenValue"
      }
    ]
  };


  // Convert the metadata object to a JSON string
  const metadataJson = JSON.stringify(metadata);

  // Define the file path and name
  const filePath = '../Data' + date + '/' + date + _id + '.json';

  // Write the metadata JSON to a file
  fs.writeFile(filePath, metadataJson, err => {
    if (err) {
      console.error("Metadata creation failed!");
    } else {
      console.log(`Metadata file created in ${filePath}!`);
    }
  });
}

const readCSVFileAndRegisterOrUpdateCompanies = async () =>
{
  const stream = fs.createReadStream('../CompanyInfo.csv')
    .pipe(csv());

  for await (const row of stream) {
    const { ID, Value, Address } = row;

    await new Promise((resolve, reject) => {
      EPChainContract.methods.updateOrRegisterCompany(ID, Value, Address).send({
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
    EPChainContract.methods.setBaseURL(dataFolderCID).send({
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
  await readCSVFileAndRegisterOrUpdateCompanies();

  //Creating images in the ../imgFolder for each company based on smart contract read values
  // for (let i = 0; i < 100; i++)
  // {
  //   createImages();
  // }

  //Pinning the imgFolder to pinata IPFS
  imgFolderCID = await pinImagesToPinata();

  //Creating metadata in the ../data for each company based on smart contract read values and created images
  //Hardcoded to a for loop of 1 for now
  for (let i = 1; i <= 3; i++) 
  {
    createMetadata(i);
  }

  //Wait for 10 seconds before pinning the metadata to Pinata
  dataFolderCID = await setTimeout(() => { pinMetaDataToPinata(); }, 8000);

  //Setting the new CID of the metadata on the smart contract
  setTimeout(() => { updateCIDValueOnSmartContract(); }, 15000);

  //Minting the NFT's for all registered companies
  setTimeout(() => { mintNFTs(); }, 30000);
}

//Calling the main function every month
//const interval = setInterval(mainFunction(), 30 * 24 * 60 * 60 * 1000);
mainFunction();
//Use PROMISE functionality everywhere where needed just like in readCSVFileAndRegisterOrUpdateCompanies() function