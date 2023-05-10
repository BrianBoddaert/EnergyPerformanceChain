const fs = require("fs");
const FormData = require("form-data");
const rfs = require("recursive-fs");
const basePathConverter = require("base-path-converter");
const axios = require('axios');
const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNGM1Mjk1My0yMzViLTQ0YzItYmMyNS1lYjQwMWNiM2E5MDMiLCJlbWFpbCI6InJ1ZmF0YWxpeWV2MUBvdXRsb29rLmZyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ1YTczODFlYTk2NmNkMWFkNjQwIiwic2NvcGVkS2V5U2VjcmV0IjoiMzUwZWI3MzVkYTc5NjczMzhmNzlmMTNlNGQ0YTlmZTVhMDE0YjZhMGU0MjRkYWY1ZDA5NzZjNTQ2MWFiMzliZiIsImlhdCI6MTY4MjE3OTEwOH0.u0-18e7HTi5s6qBlGZt7AENFzu0ro23X3e-xG1KfwXA'

//CID vars
let imgFolderCID = "";
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

const mainFunction = async () =>
{
  //creating images in the ../imgFolder for each company based on smart contract read values
  // for (let i = 0; i < 100; i++)
  // {
  //   createImages();
  // }

  //pinning the imgFolder to pinata IPFS
  imgFolderCID = await pinImagesToPinata();

  //creating metadata in the ../data for each company based on smart contract read values and created images
  //hardcoded to a for loop of 2 for now
  for (let i = 1; i <= 1; i++) 
  {
    createMetadata(i);
  }

  // wait for 10 seconds before pinning the metadata to Pinata
  setTimeout(() => { pinMetaDataToPinata(); }, 10000);
}

mainFunction();