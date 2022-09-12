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
import "@openzeppelin/contracts/utils/Base64.sol";


import "./StringUtils.sol";

contract Story is ERC721, IERC2981, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    address private openSeaProxyRegistryAddress;
    bool private isOpenSeaProxyActive = true;

    uint256 public constant pricePerChar = 0.0005 ether;
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
        TokenMetadata memory parentMetadata = mintedTokens[parentId];
        require(textCharCount <= maxCharsPerMint, 'Number of characters exceeds limit');
        require(
            pricePerChar * textCharCount == msg.value,
            "Incorrect ETH value sent"
        );
        require(parentMetadata.isBeginning, "Text must belong to a story");
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
      uint256 balance = getBalanceOf(tokenId);
      require(balance >= amount, "Insufficient balance");
      require(ownerOf(tokenId) == msg.sender, "Unauthorized attempt to withdraw");

      TokenMetadata storage metadata = mintedTokens[tokenId];
      metadata.withdrawn += amount;

      mintedTokens[tokenId] = metadata;
      (bool sent,) = (msg.sender).call{value: amount}("");
      require(sent, "Failed to withdraw");
    }

    // ============ PUBLIC READ-ONLY FUNCTIONS ============

    function getLastTokenId() external view returns (uint256) {
        return mintedTokens.length - 1;
    }

    function getMintPrice(uint256 numberOfChars) external pure returns (uint256) {
        return SafeMath.mul(numberOfChars, pricePerChar);
    }

    function getBalanceOf(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
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

    function tokenURI(uint256 tokenId) public view override tokenExists(tokenId) returns (string memory) {
    bytes memory dataURI = abi.encodePacked(
        '{',
            '"name": "Story #', tokenId.toString(), '",',
            '"image": "', generateSvg(tokenId), '"',
            '"attributes: "', getTokenAttributes(tokenId),'"',
        '}'
    );
    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
    );
}

   function generateSvg(uint256 tokenId) internal view tokenExists(tokenId) returns (string memory) {
       TokenMetadata memory metadata = mintedTokens[tokenId];
       bytes memory svg = abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
        '<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>',
        '<rect width="100%" height="100%" fill="black" />',
        '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">', string(metadata.text), '</text>',
        '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">', "--", getAuthor(tokenId, metadata.owner),'</text>',
        // TODO title, date
        '</svg>'
    );
    return string(
        abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(svg)
        )    
    );
   }

   function getTokenAttributes(uint256 tokenId) internal view tokenExists(tokenId) returns (string memory) {
       TokenMetadata memory metadata = mintedTokens[tokenId];
       return abi.encodePacked(
        '[{"trait_type":"Author", "value": ',
        getAuthor(tokenId, metadata.owner),
        '}, {"trait_type":"Word Count", "value": "',
        StringUtils.strlen(metadata.text).toString(),
        '"}]'
        // TODO title, date
      );
   }

   function getAuthor(
    uint256 tokenId,
    address ownerAddress
  ) internal view tokenExists(tokenId) returns (bytes memory) {
    string memory authorEns = ENSNameResolver.getENSName(ownerAddress);
    return
        bytes(authorEns).length > 0
          ? authorEns
          : string(abi.encodePacked('0x', toAsciiString(ownerAddress)));
  }

   function toAsciiString(address x) internal pure returns (string memory) {
    bytes memory s = new bytes(40);
    for (uint256 i; i < 20; i++) {
      bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
      bytes1 hi = bytes1(uint8(b) / 16);
      bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
      s[2 * i] = char(hi);
      s[2 * i + 1] = char(lo);
    }
    return string(s);
  }

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