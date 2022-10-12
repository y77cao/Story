//SPDX-License-Identifier: MIT
//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "./StoryStringUtils.sol";
import "./ENSNameResolver.sol";

error NonEOASender();
error InvalidText();
error TextWithoutParent();
error IncorrectEthValue();
error TokenNotExist();
error MoreTextMintRequired();
error InsufficientBalance();
error UnauthorizedWithdraw();
error WithdrawFailed();
error NonExistentToken();

contract Story is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant pricePerChar = 0.0005 ether;
    uint256 public constant numberOfMintRequiredToStartStory = 10;

    struct TokenMetadata {
      address creator;
      bool isBeginning;
      bytes32 title;
      string text;
      uint256 parentTokenId;
      uint256 amount;
      uint256 withdrawn;
    }

    TokenMetadata[] mintedTokens;

    constructor() ERC721("Story", "STORY") {}

    // ============ PUBLIC FUNCTIONS ============

    function mint(string memory text, uint256 parentId)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        uint256 textCharCount = StoryStringUtils.strlen(text);
        if (!_exists(parentId)) revert NonExistentToken();
        if (!StoryStringUtils.validate(text)) revert InvalidText();
        if (pricePerChar * textCharCount != msg.value) revert IncorrectEthValue();
        if (!mintedTokens[parentId].isBeginning) revert TextWithoutParent();
        if (tx.origin != msg.sender) revert NonEOASender();

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

    function mintWithTitle(bytes32 title, string memory text)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        uint256 textCharCount = StoryStringUtils.strlen(text);
        if (!StoryStringUtils.validate(StoryStringUtils.bytes32ToString(title))) revert InvalidText();
        if (!StoryStringUtils.validate(text)) revert InvalidText();
        if (pricePerChar * textCharCount != msg.value) revert IncorrectEthValue();
        if (tx.origin != msg.sender) revert NonEOASender();

        uint256 nextId = mintedTokens.length;
        if (!canMintWithTitle(nextId)) {
        revert MoreTextMintRequired();
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
      if (getBalanceOf(tokenId) < amount) revert InsufficientBalance();
      if (ownerOf(tokenId)!= msg.sender) revert UnauthorizedWithdraw();

      TokenMetadata storage metadata = mintedTokens[tokenId];
      metadata.withdrawn += amount;

      mintedTokens[tokenId] = metadata;
      (bool sent,) = (msg.sender).call{value: amount}("");
      if (!sent) revert WithdrawFailed();
    }

    // ============ PUBLIC READ-ONLY FUNCTIONS ============
    function canMintWithTitle(uint nextTokenId) public view returns (bool) {
        // only owner can start this game :/
        if (nextTokenId == 0) return owner() == address(msg.sender);
 
        uint256 numberOfStoriesOwned = balanceOf(msg.sender);
        if (numberOfStoriesOwned < numberOfMintRequiredToStartStory) return false;
        return true;
    }

    function getMintPrice(uint256 numberOfChars) external pure returns (uint256) {
        return numberOfChars * pricePerChar;
    }

    function getBalanceOf(uint256 tokenId) public view returns (uint256) {
      if (!_exists(tokenId)) revert NonExistentToken();
      uint256 balance = 0;
      TokenMetadata memory metadata = mintedTokens[tokenId];
      for (uint256 i = tokenId; i < mintedTokens.length; i++) {
        balance += (mintedTokens[i].amount / (i + 1));
      }

      return balance - metadata.withdrawn;
    }

    function getAllTokens() public view returns (TokenMetadata[] memory) {
        return mintedTokens;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
    if (!_exists(tokenId)) revert NonExistentToken();
    TokenMetadata memory metadata = mintedTokens[tokenId];
    bytes32 title = mintedTokens[metadata.parentTokenId].title;
    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(
                abi.encodePacked(
                    '{',
                        '"name": "Story #', tokenId.toString(), '",',
                        '"image": "', generateSvg(metadata.text, metadata.creator, title), '"',
                        '"attributes: "', getTokenAttributes(tokenId),'"',
                    '}'
                )
            )
        )
    );
}

   function generateSvg(string memory text, address creator, bytes32 title) public view returns (string memory) {
       bytes memory svg = abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
        '<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>',
        '<rect width="100%" height="100%" fill="black" />',
        generateTextSvg(text, creator, title),
        '</svg>'
    );
    return string(
        abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(svg)
        )    
    );
   }

   function generateTextSvg(string memory text, address creator, bytes32 title) public view returns (string memory) {
       string[] memory wrappedText = StoryStringUtils.textWrap(text);
       bytes memory svg = abi.encodePacked('');
       uint textStartPos = 70 - wrappedText.length * 10;
       for (uint i = 0; i < wrappedText.length; i++) {
           svg = abi.encodePacked(svg, 
           '<text x="50%" y="', textStartPos.toString(), '%" class="base" dominant-baseline="middle" text-anchor="middle">', wrappedText[i], '</text>'
           );
           textStartPos += 10;
       }
       svg = abi.encodePacked(svg, 
           '<text x="50%" y="', (textStartPos).toString(), '%" class="base" dominant-baseline="middle" text-anchor="middle">', getAuthor(creator),'</text>'
           '<text x="50%" y="', (textStartPos+10).toString(), '%" class="base" dominant-baseline="middle" text-anchor="middle">', StoryStringUtils.bytes32ToString(title),'</text>'
           );

       return string(svg);
   }

   function getTokenAttributes(uint256 tokenId) public view returns (bytes memory) {
       if (!_exists(tokenId)) revert NonExistentToken();
       TokenMetadata memory metadata = mintedTokens[tokenId];
       return abi.encodePacked(
        '[{"trait_type":"Author", "value": ',
        getAuthor(metadata.creator),
        '}, {"trait_type":"Word Count", "value": "',
        StoryStringUtils.strlen(metadata.text).toString(),
        '"}]'
        // TODO title, date
      );
   }

   function getAuthor(address ownerAddress) internal view returns (string memory) {
    string memory authorEns = ''; // ENSNameResolver.lookupENSName(ownerAddress);
    return
        bytes(authorEns).length > 0
          ? authorEns
          : string(abi.encodePacked('0x', StoryStringUtils.toAsciiString(ownerAddress)));
  }
}

// TODO new story every 10 mint