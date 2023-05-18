//SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract EPChain is ERC721, Ownable
{
    struct Company
    {
        address companyAddress;
        uint mintedCount;
    }

    using Strings for uint;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint private MINT_PRICE = 0;

    function setMintPrice(uint mintPrice) public onlyOwner
    {
        MINT_PRICE = mintPrice;
    }
    
    //ID to company
    mapping(uint => Company) private companies;
    uint private amountOfCompanies;

    //Temporary var 
    uint MAX_ENERGY_EFFICIENCY = 100;
    
    string private _baseURL = "https://gateway.pinata.cloud/ipfs/QmdpvArQjD5Dpfp9e3YNqAnfaA8Ccx5oX8ydNeyUNtpM9E";

    constructor() ERC721("EPChain", "EPC")
    {}

    //To be able to link the NFT to a different folder for the newly generated/updated metadata on IPFS
    function setBaseURL(string memory baseURL) public onlyOwner
    {
        _baseURL = baseURL;
    }

    //Has to be overriden to return the custom base URL that we have given
    function _baseURI() internal view override returns (string memory) 
    {
        return _baseURL;
    }

    //Updating or registering a company and their data, currently only energyUsage but can be a struct containing all the other data
    function registerCompany(uint id, address companyAddress) public onlyOwner
    {
        //If companyAddress is 0 it means we are registering a company so we can increment the count
        if (companies[id].companyAddress == address(0x0)) //check if it works!!!
        {
            ++amountOfCompanies;
            companies[id].companyAddress = companyAddress;
        }
    }

    //Uses the token Id that we assign to it when minted to bind the NFT to the correct metadata in the _baseURI CID folder on IPFS
    function tokenURI(uint tokenId) public view override returns (string memory) 
    {
        require(_exists(tokenId), "Token ID invalid.");
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, "/", tokenId.toString(), ".json")) 
            : "";
    }

    //Minting NFT for the registered companies
    function mintForRegisteredCompanies(uint date) external onlyOwner 
    {
        for (uint i = 1; i <= amountOfCompanies; ++i)
        {
            _mintToken(date, companies[i].companyAddress);
        }
        _tokenIds.reset();
    }

    //Internal mint function that increments the token id (will always be equal to the index in for loop where it's being called) and mints
    function _mintToken(uint date, address to) internal 
    {
        _tokenIds.increment();
        uint newItemId = _tokenIds.current();
        _safeMint(to, concatenateUint(date, newItemId));
        companies[newItemId].mintedCount += 1;
    }

    //Takes two uints and combines them into one uint
    function concatenateUint(uint date, uint value) internal pure returns (uint)
    {
        uint digits = 0;
        uint temp = value;
        while (temp != 0) 
        {
            digits++;
            temp /= 10;
        }
        uint factor = 10 ** digits;
        return date * factor + value;
    }
}