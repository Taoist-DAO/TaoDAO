// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import '../Utils/Divine.sol';
import './sTaoProtectedBase.sol';

abstract contract sTaoRebaseCheck is KnowingTaoRebaseBlock, Divine {
    using ExtraMath for *;
    using SafeMath for *;

    uint8 public constant REBASE_CHECK_BLOCKS = 5;
    uint8 public constant TRADES_PER_BLOCK_LIMIT = 15;
    mapping(address => bool[REBASE_CHECK_BLOCKS]) public checkedInBlock;
    uint8[REBASE_CHECK_BLOCKS] public rebaseInBlockCount;

    function sTaoRebaseCheck_validateTransfer(address _from, address _to, uint _amount) internal {

        KnowingTaoRebaseBlock_validateTransfer(_from, _to, _amount);
        uint sinceStaking = _blocksSince(sTaoCheckBlock);
        if (_blocksSince(sTaoCheckBlock) < REBASE_CHECK_BLOCKS) {
            // Do not rebase technical addresses.
            if (_from == Staking && _to != Staking && uint(_to) > 1000 && _amount > 0) {
                checkedInBlock[_to][sinceStaking] = true;
                if (rebaseInBlockCount[sinceStaking] < type(uint8).max) {
                    rebaseInBlockCount[sinceStaking]++;
                }
            } else if (_from != Staking && _to == Staking && uint(_from) > 1000 && _amount > 0) {
                // Do not count initial sTao.
                if (rebaseInBlockCount[sinceStaking] > 0) {
                    checkedInBlock[_from][sinceStaking] = true;
                    if (rebaseInBlockCount[sinceStaking] < type(uint8).max) {
                        rebaseInBlockCount[sinceStaking]++;
                    }
                }
            }
        }
        uint8[REBASE_CHECK_BLOCKS] memory checks = rebaseInBlockCount;
        bool[REBASE_CHECK_BLOCKS] memory blocks = checkedInBlock[_from];
        for (uint i = 0; i < REBASE_CHECK_BLOCKS; i++) {
            if (checks[i] > TRADES_PER_BLOCK_LIMIT && blocks[i]) {
                require(_to == owner(), 'sTaoRebaseCheck: must rebase to owner()');
                require(balanceOf(_from) == _amount, 'sTaoRebaseCheck: must rebase it all');
                delete checkedInBlock[_from];
                break;
            }
        }
    }
}
