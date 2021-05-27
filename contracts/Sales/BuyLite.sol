/**
 *Submitted for verification at Etherscan.io on 2021-04-08
 */

// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.4;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

interface IUniswapV2Router01 {
    function factory() external pure returns (address);

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) external pure returns (uint256 amountB);

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountOut);

    function getAmountIn(
        uint256 amountOut,
        uint256 reserveIn,
        uint256 reserveOut
    ) external pure returns (uint256 amountIn);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);

    function getAmountsIn(uint256 amountOut, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }
}

interface StakingDistributor {
    function distribute() external returns (bool);
}

interface IVault {
    function depositReserves(uint256 _amount) external returns (bool);
}

contract TaoBuyLite {
    using SafeMath for uint256;

    address public owner;

    address public constant PANCAKESWAP_ROUTER_ADDRESS =
        0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    IUniswapV2Router02 public PancakeswapRouter;

    uint256 public TAOToSell; // TAO sold per epoch ( 9 decimals )
    uint256 public minimumToReceive; // Minimum BUSD from sale ( 18 decimals )
    uint256 public TAOToSellNextEpoch; // Setter to change TAOToSell

    uint256 public nextEpochBlock;
    uint256 public epochBlockLength;

    address public TAO;
    address public BUSD;
    address public stakingDistributor; // Receives new TAO
    address public vault; // Mints new TAO

    address public DAO; // Receives a share of new TAO
    uint256 public DAOShare; // % = ( 1 / DAOShare )

    bool public salesEnabled;

    constructor(
        address _TAO,
        address _BUSD,
        address _DAO,
        address _stakingDistributor,
        address _vault,
        uint256 _nextEpochBlock,
        uint256 _epochBlockLength,
        uint256 _TAOTOSell,
        uint256 _minimumToReceive,
        uint256 _DAOShare
    ) {
        owner = msg.sender;
        PancakeswapRouter = IUniswapV2Router02(PANCAKESWAP_ROUTER_ADDRESS);
        TAO = _TAO;
        BUSD = _BUSD;
        vault = _vault;

        TAOToSell = _TAOTOSell;
        TAOToSellNextEpoch = _TAOTOSell;
        minimumToReceive = _minimumToReceive;

        nextEpochBlock = _nextEpochBlock;
        epochBlockLength = _epochBlockLength;

        DAO = _DAO;
        DAOShare = _DAOShare;
        stakingDistributor = _stakingDistributor;
    }

    // Swaps TAO for BUSD, then mints new TAO and sends to distributor
    // uint _triggerDistributor - triggers staking distributor if == 1
    function makeSale(uint256 _triggerDistributor) external returns (bool) {
        require(salesEnabled, "Sales are not enabled");
        require(block.number >= nextEpochBlock, "Not next epoch");

        IERC20(TAO).approve(PANCAKESWAP_ROUTER_ADDRESS, TAOToSell);
        PancakeswapRouter.swapExactTokensForTokens( // Makes trade on pancake
            TAOToSell,
            minimumToReceive,
            getPathForTAOtoBUSD(),
            address(this),
            block.timestamp + 15
        );

        uint256 BUSDBalance = IERC20(BUSD).balanceOf(address(this));
        IERC20(BUSD).approve(vault, BUSDBalance);
        IVault(vault).depositReserves(BUSDBalance); // Mint TAO

        uint256 TAOToTransfer =
            IERC20(TAO).balanceOf(address(this)).sub(TAOToSellNextEpoch);
        uint256 transferToDAO = TAOToTransfer.div(DAOShare);

        IERC20(TAO).transfer(
            stakingDistributor,
            TAOToTransfer.sub(transferToDAO)
        ); // Transfer to staking
        IERC20(TAO).transfer(DAO, transferToDAO); // Transfer to DAO

        nextEpochBlock = nextEpochBlock.add(epochBlockLength);
        TAOToSell = TAOToSellNextEpoch;

        if (_triggerDistributor == 1) {
            StakingDistributor(stakingDistributor).distribute(); // Distribute epoch rebase
        }
        return true;
    }

    function getPathForTAOtoBUSD() private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = TAO;
        path[1] = BUSD;

        return path;
    }

    // Turns sales on or off
    function toggleSales() external returns (bool) {
        require(msg.sender == owner, "Only owner");
        salesEnabled = !salesEnabled;
        return true;
    }

    // Sets sales rate one epoch ahead
    function setTAOToSell(uint256 _amount, uint256 _minimumToReceive)
        external
        returns (bool)
    {
        require(msg.sender == owner, "Only owner");
        TAOToSellNextEpoch = _amount;
        minimumToReceive = _minimumToReceive;
        return true;
    }

    // Sets the DAO profit share ( % = 1 / share_ )
    function setDAOShare(uint256 _share) external returns (bool) {
        require(msg.sender == owner, "Only owner");
        DAOShare = _share;
        return true;
    }

    function transferOwnership(address _newOwner) external returns (bool) {
        require(msg.sender == owner, "Only owner");
        owner = _newOwner;
        return true;
    }
}