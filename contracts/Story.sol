//SPDX-License-Identifier: MIT
//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

contract Story is ERC721, IERC2981, Ownable, Pausable, ReentrancyGuard, PullPayment {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private tokenCounter;

    string private baseURI;
    address private openSeaProxyRegistryAddress;
    bool private isOpenSeaProxyActive = true;

    uint256 public constant PRICE_PER_CHAR = 0.001 ether;
    uint256 private maxMintNumber;

    uint256[] mintedTokens;
    mapping(uint256 => address) public tokenIdToAddress;
    mapping(address => uint256) public addressToDividends;

    // ============ ACCESS CONTROL/SANITY MODIFIERS ============
    modifier isCorrectPayment(uint256 price, uint256 numberOfChars) {
        require(
            price * numberOfChars == msg.value,
            "Incorrect ETH value sent"
        );
        _;
    }

    constructor(
        // address _openSeaProxyRegistryAddress,
        uint256 _maxMintNumber
    ) ERC721("The story", "STORY")
      Pausable() {
        // openSeaProxyRegistryAddress = _openSeaProxyRegistryAddress;
        maxMintNumber = _maxMintNumber;
    }

    // ============ PUBLIC FUNCTIONS ============

    function mint(uint256 numberOfChars)
        external
        payable
        nonReentrant
        isCorrectPayment(PRICE_PER_CHAR, numberOfChars)
        whenNotPaused
    {
        uint256 nextId = nextTokenId();
        mintedTokens.push(nextId);
        tokenIdToAddress[nextId] = msg.sender;
        _sendDividends(msg.value);
        _safeMint(msg.sender, nextId);
    }

    function withdrawDividends() 
        external 
        whenNotPaused 
        nonReentrant {
        withdrawPayments(payable(msg.sender));
    }

    // ============ PUBLIC READ-ONLY FUNCTIONS ============

    function getBaseURI() external view returns (string memory) {
        return baseURI;
    }

    function getLastTokenId() external view returns (uint256) {
        return tokenCounter.current();
    }

    function getMintPrice(uint256 numberOfChars) external view returns (uint256) {
        return SafeMath.mul(numberOfChars, PRICE_PER_CHAR);
    }

    function getDividendBalance() external view returns (uint256) {
        return payments(msg.sender);
    }

    // ============ OWNER-ONLY ADMIN FUNCTIONS ============

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    // function to disable gasless listings for security in case
    // opensea ever shuts down or is compromised
    function setIsOpenSeaProxyActive(bool _isOpenSeaProxyActive)
        external
        onlyOwner
    {
        isOpenSeaProxyActive = _isOpenSeaProxyActive;
    }

    function ownerWithdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function ownerWithdrawTokens(IERC20 token) public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(msg.sender, balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ SUPPORTING FUNCTIONS ============

    function nextTokenId() private returns (uint256) {
        tokenCounter.increment();
        return tokenCounter.current();
    }

    function _sendDividends(uint256 total) private {
        require(mintedTokens.length > 0, "Shares must be greater than zero");

        uint256 dividendPerToken = SafeMath.div(total, mintedTokens.length);

        for (uint256 i = 0; i < mintedTokens.length; i++) {
            address addressToSend = tokenIdToAddress[mintedTokens[i]];
            _transferDividends(addressToSend, dividendPerToken);
        }
    }

    function _transferDividends(address dest, uint256 amount) private {
        _asyncTransfer(dest, amount);
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
        returns (string memory)
    {
        require(_exists(tokenId), "Nonexistent token");

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
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(tokenId), "Nonexistent token");

        return (address(this), SafeMath.div(SafeMath.mul(salePrice, 5), 100));
    }
}

// These contract definitions are used to create a reference to the OpenSea
// ProxyRegistry contract by using the registry's address (see isApprovedForAll).
contract OwnableDelegateProxy {

}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}