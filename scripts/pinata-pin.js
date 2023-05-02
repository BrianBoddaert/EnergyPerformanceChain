const fs = require("fs");
const FormData = require("form-data");
const rfs = require("recursive-fs");
const basePathConverter = require("base-path-converter");
const axios = require('axios');
const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNGM1Mjk1My0yMzViLTQ0YzItYmMyNS1lYjQwMWNiM2E5MDMiLCJlbWFpbCI6InJ1ZmF0YWxpeWV2MUBvdXRsb29rLmZyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQ1YTczODFlYTk2NmNkMWFkNjQwIiwic2NvcGVkS2V5U2VjcmV0IjoiMzUwZWI3MzVkYTc5NjczMzhmNzlmMTNlNGQ0YTlmZTVhMDE0YjZhMGU0MjRkYWY1ZDA5NzZjNTQ2MWFiMzliZiIsImlhdCI6MTY4MjE3OTEwOH0.u0-18e7HTi5s6qBlGZt7AENFzu0ro23X3e-xG1KfwXA'

const pinImagesToPinata = async () => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const src = "../img";
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
        onUploadProgress: progressEvent => {
          console.log(progressEvent);
        }
      })
    console.log(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
  }
};

const pinDataToPinata = async () => {
  const url = `https://api.pinata.cloud/pinning/pinata-pin`;
  const src = "../data";
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
      onUploadProgress: progressEvent => {
        console.log(progressEvent);
      }
    });
    console.log(response.data);
  } catch (error) {
    console.log("error");
  }
};

//pinImagesToPinata()
pinDataToPinata();