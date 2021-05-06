// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "@openzeppelin/contracts-3.4.1/GSN/Context.sol";
import "@openzeppelin/contracts-3.4.1/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-3.4.1/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-3.4.1/math/SafeMath.sol";
import "@openzeppelin/contracts-3.4.1/utils/Address.sol";
import "@openzeppelin/contracts-3.4.1/access/Ownable.sol";
import "./Interfaces/IVault.sol";

contract TaoPresale is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public TAO; // 9 decimals
    IERC20 public BUSD; // 18 decimals
    address public vault;

    mapping(address => bool) public whitelistedAddresses;
    mapping(address => bool) public boughtTAO;
    mapping(address => uint256) public claimable;
    mapping(address => uint256) public claimed;

    uint256 public price;
    uint256 public taoTarget;
    uint256 public totalOwed;
    uint256 public busdRaised;
    uint256 public totalWhitelisted;

    bool public startUnlocked;
    bool public endUnlocked;
    bool public claimUnlocked;
    bool public isInitialized;
    bool public isTaoSet;

    event StartUnlockedEvent(uint256 startTimestamp);
    event EndUnlockedEvent(uint256 endTimestamp);
    event ClaimUnlockedEvent(uint256 claimTimestamp);


    modifier notInitialized() {
        require( !isInitialized );
        _;
    }

    constructor(
        IERC20 _busd
    ) {
        BUSD = IERC20(_busd);
        totalOwed = 0;
        busdRaised = 0;
    }

    function initialize(
        uint256 _taoTarget,
        uint256 _price,
        address _vault
    ) external onlyOwner() notInitialized() returns ( bool ) {
        taoTarget = _taoTarget;
        price = _price;
        isInitialized = true;
        vault = _vault;
        return true;
    }

// Functions to whitelist.
    function addWhitelistedAddress(address _address) external onlyOwner() {
        whitelistedAddresses[_address] = true;
        totalWhitelisted = totalWhitelisted.add(1);
    }

    function addMultipleWhitelistedAddresses(address[] calldata _addresses) external onlyOwner() {
         for (uint i=0; i<_addresses.length; i++) {
             whitelistedAddresses[_addresses[i]] = true;
         }
         totalWhitelisted = totalWhitelisted.add( _addresses.length );
    }

    function removeWhitelistedAddress(address _address) external onlyOwner() {
        whitelistedAddresses[_address] = false;
        totalWhitelisted = totalWhitelisted.sub(1);
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

// Set Tao
    function setTao(address _tao) external onlyOwner() {
        require(!isTaoSet, "Tao already set");
        TAO = IERC20(_tao); //9 decimals#
        isTaoSet = true;
    }


// Functions including unlockStart() during presale.
    function unlockStart() external onlyOwner() {
        require(!startUnlocked, 'Presale already started!');
        require(isInitialized, 'Presale is not Initialized');
        startUnlocked = true;
        StartUnlockedEvent(block.timestamp);
    }

    function getAllotmentPerBuyer() public view returns (uint) {
        require(totalWhitelisted > 0, 'Nobody is Whitelisted');
        return (taoTarget.sub(totalOwed)).div(totalWhitelisted).mul(price).div(1e9);
    }

    function buy(uint _amountBUSD) public returns(bool) {
        require(startUnlocked, 'presale has not yet started');
        require(!endUnlocked, 'presale already ended');
        require(whitelistedAddresses[msg.sender] == true, 'you are not whitelisted');
        require(boughtTAO[msg.sender] == false, 'Already Participated');
        require(_amountBUSD <= getAllotmentPerBuyer(), 'More than alloted');

        boughtTAO[msg.sender] = true;

        BUSD.safeTransferFrom(msg.sender, address(this), _amountBUSD);
        claimable[msg.sender] = claimable[msg.sender].add(_amountBUSD.div(price)).mul(1e9);
        totalOwed = totalOwed.add(_amountBUSD.div(price).mul(1e9));
        busdRaised = busdRaised.add(_amountBUSD);
        totalWhitelisted = totalWhitelisted.sub(1);
        return true;
    }

// Functions inlcuding unlockEnd() after presale.
    function unlockEnd() external onlyOwner() {
        require(!endUnlocked, 'Presale already ended!');
        endUnlocked = true;
        EndUnlockedEvent(block.timestamp);
    }

    function convertBUSDToTAO( uint _amountToConvert ) external onlyOwner() returns ( bool ) {
        require(startUnlocked, 'presale has not yet started');
        require(endUnlocked, 'Presale has not ended!');
        require(isTaoSet, 'Tao Not Set!');

        IERC20( BUSD ).approve( vault, _amountToConvert );
        IVault( vault ).depositReserves( _amountToConvert );

        return true;
    }
// Functions including unlockClaim() for when claimable.
    function unlockClaim() external onlyOwner() {
        require(endUnlocked, 'Presale has not ended!');
        require(!claimUnlocked, 'Claim already unlocked!');
        require(isTaoSet, 'Tao Not Set!');
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
        claimed[msg.sender] = claimed[msg.sender].add(amount);

        require(TAO.transfer(msg.sender, amount), 'failed to claim');
    }

    function withdrawRemainingBusd() external onlyOwner() returns(bool) {
        require(startUnlocked, 'presale has not started!');
        require(endUnlocked, 'presale has not yet ended!');
        require(claimUnlocked, 'claiming not allowed yet');
        BUSD.safeTransfer(msg.sender, BUSD.balanceOf(address(this)));
        return true;
    }
}
