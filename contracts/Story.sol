//SPDX-License-Identifier: MIT
//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Base64.sol";


import "./StringUtils.sol";
import "./ENSNameResolver.sol";

contract Story is ERC721, Ownable, ReentrancyGuard, ENSNameResolver {
    using Strings for uint256;

    uint256 public constant pricePerChar = 0.005 ether;
    uint256 public constant maxCharsPerMint = 280;
    uint256 public constant numberOfMintRequiredToStartStory = 10;

    struct TokenMetadata {
      address creator;
      bool isBeginning;
      bytes32 title;
      bytes text;
      uint256 parentTokenId;
      uint256 amount;
      uint256 withdrawn;
    }

    TokenMetadata[] mintedTokens;

    // ============ ACCESS CONTROL/SANITY MODIFIERS ============
    modifier tokenExists(uint256 tokenId) {
      require(_exists(tokenId), "Nonexistent token");
      _;
    }

    constructor() ERC721("Story", "STORY") {}

    // ============ PUBLIC FUNCTIONS ============

    function mint(bytes memory text, uint256 parentId)
        external
        payable
        nonReentrant
        tokenExists(parentId)
        returns (uint256)
    {
        uint256 textCharCount = StringUtils.strlen(text);
        require(textCharCount <= maxCharsPerMint, "Number of characters exceeds limit");
        require(
            pricePerChar * textCharCount == msg.value,
            "Incorrect ETH value sent"
        );
        require(mintedTokens[parentId].isBeginning, "Text must belong to a story");
        if (tx.origin != msg.sender) revert();

        uint256 nextId = mintedTokens.length;
        mintedTokens.push(TokenMetadata({creator: msg.sender, 
                                                 isBeginning: false,
                                                 title: bytes32(0),
                                                 text: text,
                                                 parentTokenId: parentId,
                                                 amount: msg.value, 
                                                 withdrawn: 0}));
        _safeMint(msg.sender, nextId);

        return nextId;
    }

    function mintWithTitle(bytes32 title, bytes memory text)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        uint256 textCharCount = StringUtils.strlen(text);
        require(textCharCount <= maxCharsPerMint, "Number of characters exceeds limit");
        require(
            pricePerChar * textCharCount == msg.value,
            "Incorrect ETH value sent"
        );
        if (tx.origin != msg.sender) revert();

        uint256 nextId = mintedTokens.length;
        if (nextId != 0) {
           uint256 numberOfStoriesOwned = balanceOf(msg.sender);
           require(numberOfStoriesOwned >= numberOfMintRequiredToStartStory, "Must write more before starting your own");
        }
        mintedTokens.push(TokenMetadata({creator: msg.sender, 
                                                 isBeginning: true,
                                                 title: title,
                                                 text: text,
                                                 parentTokenId: nextId,
                                                 amount: msg.value, 
                                                 withdrawn: 0}));
        _safeMint(msg.sender, nextId);

        return nextId;
    }

    function withdraw(uint256 tokenId, uint256 amount) public {
      require(getBalanceOf(tokenId) >= amount, "Insufficient balance");
      require(ownerOf(tokenId) == msg.sender, "Unauthorized attempt to withdraw");

      TokenMetadata storage metadata = mintedTokens[tokenId];
      metadata.withdrawn += amount;

      mintedTokens[tokenId] = metadata;
      (bool sent,) = (msg.sender).call{value: amount}("");
      require(sent, "Failed to withdraw");
    }

    // ============ PUBLIC READ-ONLY FUNCTIONS ============
    function getMintPrice(uint256 numberOfChars) external pure returns (uint256) {
        return SafeMath.mul(numberOfChars, pricePerChar);
    }

    function getBalanceOf(uint256 tokenId) public view tokenExists(tokenId) returns (uint256) {
      uint256 balance = 0;
      TokenMetadata memory metadata = mintedTokens[tokenId];
      for (uint256 i = tokenId; i < mintedTokens.length; i++) {
        balance += (mintedTokens[i].amount / (i+1)); // TODO safemath
      }

      return balance - metadata.withdrawn;
    }

    function getAllTokens() public view returns (TokenMetadata[] memory) {
        return mintedTokens;
    }

    function nextTokenId() private view returns (uint256) {
        return mintedTokens.length;
    }

    function tokenURI(uint256 tokenId) public view override tokenExists(tokenId) returns (string memory) {
    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(
                abi.encodePacked(
                    '{',
                        '"name": "Story #', tokenId.toString(), '",',
                        '"image": "', generateSvg(tokenId), '"',
                        '"attributes: "', getTokenAttributes(tokenId),'"',
                    '}'
                )
            )
        )
    );
}

   function generateSvg(uint256 tokenId) public view tokenExists(tokenId) returns (string memory) {
       TokenMetadata memory metadata = mintedTokens[tokenId];
       bytes memory svg = abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
        '<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>',
        '<rect width="100%" height="100%" fill="black" />',
        '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">', string(metadata.text), '</text>',
        '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">', "--", getAuthor(tokenId, metadata.creator),'</text>',
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

   function getTokenAttributes(uint256 tokenId) public view tokenExists(tokenId) returns (bytes memory) {
       TokenMetadata memory metadata = mintedTokens[tokenId];
       return abi.encodePacked(
        '[{"trait_type":"Author", "value": ',
        getAuthor(tokenId, metadata.creator),
        '}, {"trait_type":"Word Count", "value": "',
        StringUtils.strlen(metadata.text).toString(),
        '"}]'
        // TODO title, date
      );
   }

   function getAuthor(
    uint256 tokenId,
    address ownerAddress
  ) internal view tokenExists(tokenId) returns (string memory) {
    string memory authorEns = ENSNameResolver.getENSName(ownerAddress);
    return
        bytes(authorEns).length > 0
          ? authorEns
          : string(abi.encodePacked('0x', StringUtils.toAsciiString(ownerAddress)));
  }
}