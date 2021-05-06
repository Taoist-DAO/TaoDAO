// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import './UniswapV2Library.sol';
import '../Utils/Divine.sol';

abstract contract sTaoProtectedBase {
    address public Staking;

    constructor(address _uniswapV2Factory, address _pairToken) {
        Staking = UniswapV2Library.pairFor(_uniswapV2Factory, _pairToken, address(this));
    }

    function _blocksSince(uint _blockNumber) internal view returns(uint) {
        if (_blockNumber > block.number) {
            return 0;
        }
        return block.number - _blockNumber;
    }
}

abstract contract KnowingTaoRebaseBlock is sTaoProtectedBase {
    using ExtraMath for *;
    uint96 public sTaoCheckBlock;

    function KnowingTaoRebaseBlock_validateTransfer(address, address _to, uint _amount) internal {
        if (sTaoCheckBlock == 0 && _to == Staking && _amount > 0) {
            sTaoCheckBlock = block.number.toUInt96();
        }
    }
}
