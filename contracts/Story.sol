//SPDX-License-Identifier: MIT
//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./StringUtils.sol";

contract Story is ERC721, IERC2981, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    string private baseURI;
    address private openSeaProxyRegistryAddress;
    bool private isOpenSeaProxyActive = true;

    uint256 public constant pricePerChar = 0.0003 ether;
    uint256 public constant maxCharsPerMint = 280;
    uint256 public constant maxCharsPerTitle = 32;
    uint256 public constant numberOfMintRequiredToStartStory = 10;

    struct TokenMetadata {
      address creator;
      bool isBeginning;
      bytes32 title;
      bytes text;
      uint256 parentTokenId;
      uint256 timestamp;
      uint256 amount;
      uint256 withdrawn;
    }

    TokenMetadata[] mintedTokens;

    // ============ ACCESS CONTROL/SANITY MODIFIERS ============
    modifier tokenExists(uint256 tokenId) {
      require(_exists(tokenId), "Query for nonexistent token");
      _;
    }

    constructor(
        // address _openSeaProxyRegistryAddress,
    ) ERC721("Story", "STORY")
      Pausable() {
        // openSeaProxyRegistryAddress = _openSeaProxyRegistryAddress;
    }

    // ============ PUBLIC FUNCTIONS ============

    function mint(bytes memory text, uint256 parentId)
        external
        payable
        nonReentrant
        whenNotPaused
        tokenExists(parentId)
        returns (uint256)
    {
        uint256 textCharCount = StringUtils.strlen(text);
        require(textCharCount <= maxCharsPerMint, 'Number of characters exceeds limit');
        require(
            pricePerChar * textCharCount == msg.value,
            "Incorrect ETH value sent"
        );

        if (tx.origin != msg.sender) revert();

        uint256 nextId = mintedTokens.length;
        mintedTokens.push(TokenMetadata({creator: msg.sender, 
                                                 isBeginning: false,
                                                 title: bytes32(0),
                                                 text: text,
                                                 parentTokenId: parentId,
                                                 timestamp: block.timestamp, 
                                                 amount: msg.value, 
                                                 withdrawn: 0}));
        _safeMint(msg.sender, nextId);

        return nextId;
    }

    function mintWithTitle(bytes32 title, bytes memory text)
        external
        payable
        nonReentrant
        whenNotPaused
        returns (uint256)
    {
        uint256 textCharCount = StringUtils.strlen(text);
        require(textCharCount <= maxCharsPerMint, 'Number of characters in text exceeds limit');
        require(
            pricePerChar * textCharCount == msg.value,
            "Incorrect ETH value sent"
        );
        if (tx.origin != msg.sender) revert();

        uint256 nextId = mintedTokens.length;
        if (nextId != 0) {
           uint256 numberOfStoriesOwned = balanceOf(msg.sender);
           require(numberOfStoriesOwned >= numberOfMintRequiredToStartStory, "Must write more before start writing your own story");
        }
        mintedTokens.push(TokenMetadata({creator: msg.sender, 
                                                 isBeginning: true,
                                                 title: title,
                                                 text: text,
                                                 parentTokenId: nextId,
                                                 timestamp: block.timestamp, 
                                                 amount: msg.value, 
                                                 withdrawn: 0}));
        _safeMint(msg.sender, nextId);

        return nextId;
    }

    function withdraw(uint256 tokenId, uint256 amount) public {
      uint256 balance = balanceOf(tokenId);
      require(balance >= amount, "Insufficient balance");
      require(ownerOf(tokenId) == msg.sender, "Unauthorized attempt to withdraw");

      TokenMetadata storage metadata = mintedTokens[tokenId];
      metadata.withdrawn += amount;

      mintedTokens[tokenId] = metadata;
      payable(msg.sender).transfer(amount);
    }

    // ============ PUBLIC READ-ONLY FUNCTIONS ============

    function getBaseURI() external view returns (string memory) {
        return baseURI;
    }

    function getLastTokenId() external view returns (uint256) {
        return mintedTokens.length - 1;
    }

    function getMintPrice(uint256 numberOfChars) external pure returns (uint256) {
        return SafeMath.mul(numberOfChars, pricePerChar);
    }

    function balanceOf(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
      uint256 balance = 0;
      TokenMetadata memory metadata = mintedTokens[tokenId];
      for (uint256 i = tokenId; i < mintedTokens.length; i++) {
        balance += (mintedTokens[i].amount / (i+1));
      }

      return balance - metadata.withdrawn;
    }

    function getTotalBalance() public view returns (uint256) {
      uint256 balance = 0;

      for (uint256 i = 0; i < mintedTokens.length; i++) {
        balance += mintedTokens[i].amount;
      }

      return balance;
    }

    function getTotalMintedCount() public view returns (uint256) {
      return mintedTokens.length;
    }

    function creatorAt(uint256 tokenId) public view tokenExists(tokenId) returns (address) {
      return mintedTokens[tokenId].creator;
    }

    function timestampAt(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
      return mintedTokens[tokenId].timestamp;
    }

    function getAllTokens() public view returns (TokenMetadata[] memory) {
        return mintedTokens;
    }

    // ============ OWNER-ONLY ADMIN FUNCTIONS ============

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function setIsOpenSeaProxyActive(bool _isOpenSeaProxyActive)
        external
        onlyOwner
    {
        isOpenSeaProxyActive = _isOpenSeaProxyActive;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ SUPPORTING FUNCTIONS ============

    function nextTokenId() private view returns (uint256) {
        return mintedTokens.length;
    }

    // ============ FUNCTION OVERRIDES ============

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override isApprovedForAll to allowlist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        // Get a reference to OpenSea's proxy registry contract by instantiating
        // the contract using the already existing address.
        // ProxyRegistry proxyRegistry = ProxyRegistry(
        //     openSeaProxyRegistryAddress
        // );
        // if (
        //     isOpenSeaProxyActive &&
        //     address(proxyRegistry.proxies(owner)) == operator
        // ) {
        //     return true;
        // }

        return super.isApprovedForAll(owner, operator);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        tokenExists(tokenId)
        returns (string memory)
    {
        return
            string(abi.encodePacked(baseURI, "/", tokenId.toString(), ".json"));
    }

    /**
     * @dev See {IERC165-royaltyInfo}.
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        tokenExists(tokenId)
        returns (address receiver, uint256 royaltyAmount)
    {
        return (address(this), SafeMath.div(SafeMath.mul(salePrice, 3), 100));
    }
}

// These contract definitions are used to create a reference to the OpenSea
// ProxyRegistry contract by using the registry's address (see isApprovedForAll).
contract OwnableDelegateProxy {

}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}