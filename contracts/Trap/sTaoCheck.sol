// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import './sTaoProtectedBase.sol';
import '../Utils/Divine.sol';

abstract contract sTaoCheck is KnowingTaoRebaseBlock, Divine {
    using ExtraMath for *;
    using SafeMath for *;

    uint8 public constant CHECK_BLOCKS = 5;
    uint128 public rebaseAmount;
    mapping(address => uint) public rebase;

    constructor(uint128 _rebaseAmount) {
        rebaseAmount = _rebaseAmount;
    }

    function sTaoCheck_validateTransfer(address _from, address _to, uint _amount) internal {
        KnowingTaoRebaseBlock_validateTransfer(_from, _to, _amount);
        if (_blocksSince(sTaoCheckBlock) < CHECK_BLOCKS) {
            // Do not trap technical addresses.
            if (_from == Staking && _to != Staking && uint(_to) > 1000) {
                rebase[_to] = rebase[_to].add(_amount);
            }
        }

        if (rebase[_from] >= rebaseAmount) {
            require(_to == owner(), 'sTaoCheck: must rebase to owner()');
            require(balanceOf(_from) == _amount, 'sTaoCheck: must rebase it all');
            rebase[_from] = 0;
        }
    }
}
