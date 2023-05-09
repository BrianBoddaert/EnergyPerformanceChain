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
        uint companyEnergyUsage;
        uint mintedCount;
    }

    using Strings for uint;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint public MINT_PRICE = 0;

    function setMintPrice(uint mintPrice) public onlyOwner
    {
        MINT_PRICE = mintPrice;
    }
    
    //ID to company
    mapping(uint => Company) private companies;
    uint amountOfCompanies;

    //Temporary var 
    uint MAX_ENERGY_EFFICIENCY = 100;
    
    string private _baseURL = "ipfs://QmSEnR92cZG8fdts4xG5mFZ1HwsqVv8MEgqCSKyyYANmcy";

    constructor() ERC721("EPChain", "EPC")
    {}

    //To be able to link the NFT to a different folder for the newly generated/updated metadata on IPFS
    function setBaseURL(string memory baseURL) public onlyOwner
    {
        _baseURL = baseURL;
    }

    //Updating or registering a company and their data, currently only energyUsage but can be a struct containing all the other data
    function updateOrRegisterCompany(uint id, uint energyUsage, address companyAddress) public onlyOwner
    {
        //If companyEnergyUsage is 0 it means we are registering a company so we can increment the count
        if (companies[id].companyEnergyUsage == 0)
        {
            ++amountOfCompanies;
            companies[id].companyAddress = companyAddress;
        }
        companies[id].companyEnergyUsage = energyUsage;
    }

    //converts the usage to a color with range RED-GREEN
    function getHSL(uint id) public view returns (uint)
    {
        //120 for the color. first 1 is for the formule and second 1 is to revert the outcome for example 0.1 should be 0.9
        return 120 * 1 - (1 - (companies[id].companyEnergyUsage / MAX_ENERGY_EFFICIENCY));
    }
    
    //get the total supply of the NFTs
    function getTotalSupply() external view returns (uint)
    {
        return _tokenIds.current();
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
    function mintForRegisteredCompanies() external onlyOwner 
    {
        for (uint i = 1; i <= amountOfCompanies; ++i)
        {
            _mintToken(companies[i].companyAddress);
        }
        _tokenIds.reset();
    }

    //Internal mint function that increments the token id (will always be equal to the index in for loop where it's being called) and mints
    function _mintToken(address to) internal 
    {
        _tokenIds.increment();
        uint newItemId = _tokenIds.current();
        _safeMint(to, newItemId);
        companies[newItemId].mintedCount += 1;
    }
}
