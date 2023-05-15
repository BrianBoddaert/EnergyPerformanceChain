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
const web3 = new Web3(process.env.INFURA_URL);
//Contract details
const contractABI = require('../SmartContracts/EPChain-abi.json'); //Should be updated if we deploy a new, updated smart contract
const contractAddress = '0xdC55902925266A8ccC7972143789A06e5616FC65' //This has to be deployed smart contract address on the GOERLI testnet
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
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const src = "../Images" + date;
  try {
    const { dirs, files } = await rfs.read(src);
    let data = new FormData();
    for (const file of files) {
      data.append(`file`, fs.createReadStream(file), {
        filepath: basePathConverter(src, file),
      });
    }    
    const response = await axios.post(url, data, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          "Authorization": JWT
        },
        // onUploadProgress: progressEvent => {
        //   console.log(progressEvent);
        // }
      })
    console.log("Pin image succeeded!"); // this logs the CID key
    return response.data.IpfsHash;
  } catch (error) {
    console.log("Pin image failed!");
  }
};

const pinMetaDataToPinata = async () => 
{
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const src = "../Data" + date;
  try {
    const { dirs, files } = await rfs.read(src);
    let data = new FormData();
    for (const file of files) {
      // Only include JSON files
      if (file.endsWith(".json")) {
        data.append(`file`, fs.createReadStream(file), {
          filepath: basePathConverter(src, file),
        });
      }
    }
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        "Authorization": JWT
      },
      // onUploadProgress: progressEvent => {
      //   console.log(progressEvent);
      // }
    });
    console.log("Pin metadata succeeded!");
    return response.data.IpfsHash;
  } catch (error) {
    console.log("Pin metadata failed!");
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

const readCSVFileAndRegisterOrUpdateCompanies = async () => {
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
  await EPChainContract.methods.mintForRegisteredCompanies(date).send
  (
    {
      from : '0x972B4B46e0baBb59fE2cA41ef3D6aBFA2741623d',
      gas: 3000000,
    }
  )
}

const updateCIDValueOnSmartContract = async () =>
{
  console.log(dataFolderCID);
  await EPChainContract.methods.setBaseURL(dataFolderCID).send
  (
    {
      from : '0x972B4B46e0baBb59fE2cA41ef3D6aBFA2741623d',
      gas: 3000000,
    }
  )
}

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
  dataFolderCID = await setTimeout(() => { pinMetaDataToPinata(); }, 10000);

  //Setting the new CID of the metadata on the smart contract
  await updateCIDValueOnSmartContract();

  //Minting the NFT's for all registered companies
  setTimeout(() => { mintNFTs(); }, 10000);
}

//Calling the main function every month
//const interval = setInterval(mainFunction(), 30 * 24 * 60 * 60 * 1000);
mainFunction();
//Use PROMISE functionality everywhere where needed just like in readCSVFileAndRegisterOrUpdateCompanies() function