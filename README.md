![EnergyPerformanceChain](https://user-images.githubusercontent.com/35961897/236497046-c29790d1-6b4d-4614-a586-336dc8c76952.png)
<h1>Energy performance Chain</h1>
<h3>Goal</h3>
<p>The Energy Performance Chain is a decentralized application that considers the energy spending of companies comparing them to other companies of similar industries, sizes and locations. </p>
<p>Displayed and usable at [Energyperformancechain.com](http://www.energyperformancechain.com/) </p>
<p>Companies are compared on the following categories: </p>

* Amount of energy used

* Green energy usage

* Energy sharing of companies

<p>The energy performance chain periodically mints an NFT for every company listed, the NFT's metadata is generated depending on their ranking in the beforementioned categories. </p>

<h3>Logic </h3>
<p>Companies can sign up using the website, they have to link their metamask account which will come to own the NFT. After signing up their information gets stored on a .CSV file on the server. Then, utilizing a timer, every month the server compares companies in the same region and industry:</p>

```javascript
const createImage = async (_id) =>
{
  const width = 100;
  const height = 100;
  const maxColor = 255;
  //calculating colors
  const yellowColor = 0.5;
  const colorVariable = (companyData[_id][1] - averageEfficiency) / (2 * averageEfficiency) + yellowColor;
  let red = Math.round(maxColor * colorVariable);
  let green = Math.round(maxColor * (1 - colorVariable));
  //clamping the colors between 0 and 255
  red = Math.min(Math.max(red, 0), maxColor);
  green = Math.min(Math.max(green, 0), maxColor);
  
  const image = new Jimp(width, height, (err, image) =>
  {
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
```

<p>After this, the server calls for the deployed smart contract to mint a new NFT for every company, with the new images passed along as metadata, which gets uploaded to IPFS and pinned using Pinata.</p>
<p>The Json files are then loaded into to our website and displayed on the overview and detail pages. </p>
