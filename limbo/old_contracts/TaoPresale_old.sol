// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;


//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/GSN/Context.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC20/IERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC20/SafeERC20.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Address.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/access/Ownable.sol";
import "@openzeppelin_/contracts/GSN/Context.sol";
import "@openzeppelin_/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin_/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin_/contracts/math/SafeMath.sol";
import "@openzeppelin_/contracts/utils/Address.sol";
import "@openzeppelin_/contracts/access/Ownable.sol";

contract TaoPresale is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public TAO; // 9 decimals
    IERC20 public BUSD; // 18 decimals

    mapping(address => bool) public whitelistedAddresses;
    mapping(address => uint256) public claimable;
    mapping(address => uint256) public totalPurchased;

    uint256 public price;
    uint256 public taoTarget;
    uint256 public maxBusd;
    uint256 public minBusd;
    uint256 public totalOwed;
    uint256 public busdRaised;

    bool public startUnlocked;
    bool public endUnlocked;
    bool public claimUnlocked;
    bool public isInitialized;

    modifier notInitialized() {
        require( !isInitialized );
        _;
    }

    constructor(
        IERC20 _busd,
        IERC20 _tao
    ) {
        BUSD = IERC20(_busd);
        TAO = IERC20(_tao); //9 decimals
        totalOwed = 0;
        busdRaised = 0;
    }

    event StartUnlockedEvent(uint256 startTimestamp);
    event EndUnlockedEvent(uint256 endTimestamp);
    event ClaimUnlockedEvent(uint256 claimTimestamp);

    function initialize(
        uint256 _taoTarget,
        uint256 _price,
        uint256 _maxBusd,
        uint256 _minBusd
    ) external onlyOwner() notInitialized() returns ( bool ) {
        taoTarget = _taoTarget;
        price = _price;
        maxBusd = _maxBusd;
        minBusd = _minBusd;
        isInitialized = true;
        return true;
    }

// Functions to whitelist.
    function addWhitelistedAddress(address _address) external onlyOwner() {
        whitelistedAddresses[_address] = true;
    }

    function addMultipleWhitelistedAddresses(address[] calldata _addresses) external onlyOwner() {
         for (uint i=0; i<_addresses.length; i++) {
             whitelistedAddresses[_addresses[i]] = true;
         }
    }

    function removeWhitelistedAddress(address _address) external onlyOwner() {
        whitelistedAddresses[_address] = false;
    }
// Functions before unlockStart() to set how much Tao is offered, at what price.
// Tao target is 9 decimals
    function setTaoTarget(uint256 _taoTarget) external onlyOwner() {
        require(!startUnlocked, 'Presale already started!');
        taoTarget = _taoTarget;
    }
// Price in 18 decimals
    function setPrice(uint256 _price) external onlyOwner() {
        require(!startUnlocked, 'Presale already started!');
        price= _price;
    }

    function setMaxBusd(uint256 _maxBusd) external onlyOwner() {
        require(!startUnlocked, 'Presale already started!');
        maxBusd = _maxBusd;
    }

    function setMinBusd(uint256 _minBusd) external onlyOwner() {
        require(!startUnlocked, 'Presale already started!');
        minBusd = _minBusd;
    }
// Functions including unlockStart() during presale.
    function unlockStart() external onlyOwner() {
        require(!startUnlocked, 'Presale already started!');
        startUnlocked = true;
        StartUnlockedEvent(block.timestamp);
    }

// Gets the BUSD allocation left for a whitelisted account.
    function getAllocationRemaining() public view returns (uint) {
        require(whitelistedAddresses[msg.sender] == true, 'you are not whitelisted');
        return maxBusd.sub(totalPurchased[msg.sender]);
    }

    function buy(uint _amountBUSD) public returns(bool) {
        require(startUnlocked, 'presale has not yet started');
        require(!endUnlocked, 'presale already ended');
        require(whitelistedAddresses[msg.sender] == true, 'you are not whitelisted');
        require(totalPurchased[msg.sender] <= maxBusd, 'you have reached your allocation limit');
        require(_amountBUSD <= maxBusd, 'More than allocation limit');
        require(_amountBUSD >= minBusd, 'Less than minimum amount');

        //BUSD.safeTransferFrom(msg.sender, address(this), _amountBUSD);
        BUSD.safeTransferFrom(msg.sender, address(this), _amountBUSD);
        claimable[msg.sender] = claimable[msg.sender].add(_amountBUSD.div(price)).mul(1e9);
        totalOwed = totalOwed.add(_amountBUSD.div(price)).mul(1e9);
        busdRaised = busdRaised.add(_amountBUSD);
        totalPurchased[msg.sender] = totalPurchased[msg.sender].add(_amountBUSD);
        return true;
    }

// Functions inlcuding unlockEnd() after presale.
    function unlockEnd() external onlyOwner() {
        require(!endUnlocked, 'Presale already ended!');
        endUnlocked = true;
        EndUnlockedEvent(block.timestamp);
    }

// Functions including unlockClaim() for when claimable.
    function unlockClaim() external onlyOwner() {
        require(endUnlocked, 'Presale has not ended!');
        require(!claimUnlocked, 'Claim already unlocked!');
        claimUnlocked = true;
        ClaimUnlockedEvent(block.timestamp);
    }

// Returns Tao claimable in 9 decimals
    function claimableAmount(address user) external view returns (uint256) {
        return claimable[user];
    }

    function claim() external {
        require(claimUnlocked, 'claiming not allowed yet');
        require(whitelistedAddresses[msg.sender] == true, 'you are not whitelisted');
        require(claimable[msg.sender] > 0, 'nothing to claim');

        uint256 amount = claimable[msg.sender];

        claimable[msg.sender] = 0;
        totalOwed = totalOwed.sub(amount);

        require(TAO.transfer(msg.sender, amount), 'failed to claim');
    }

    function withdrawRemainingBusd() external onlyOwner() returns(bool) {
        require(startUnlocked, 'presale has not started!');
        require(endUnlocked, 'presale has not yet ended!');
        BUSD.safeTransfer(msg.sender, BUSD.balanceOf(address(this)));
        return true;
    }
}








