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
    mapping(uint => Company) public companies;
    uint public amountOfCompanies;

    //Date to BaseURI
    mapping(uint => string) private baseURIs;

    //Temporary var 
    uint MAX_ENERGY_EFFICIENCY = 100;
    
    string private _baseURL = "";

    constructor() ERC721("EPChain", "EPC")
    {}

    //Returning the base URI based on the date using the mapping (because each minting period has its own baseURI)
    function getBaseURI(uint date) internal view returns (string memory) 
    {
        return baseURIs[date];
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

        //Using the modulo operator to discard the ID from the start of the tokenId and only keep the last 6 digits which represents the date
        uint256 date = tokenId % 1000000;
        string memory baseURI = getBaseURI(date);

        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, "/", tokenId.toString(), ".json")) 
            : "";
    }

    //Minting NFT for the registered companies
    function mintForRegisteredCompanies(uint date, string memory CID) external onlyOwner 
    {
        baseURIs[date] = CID;
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
        _safeMint(to, concatenateUint(newItemId, date));
        companies[newItemId].mintedCount += 1;
    }

    //Combines the id and the date
    function concatenateUint(uint id, uint date) internal pure returns (uint)
    {
        return id * 1000000 + date;
    }
}