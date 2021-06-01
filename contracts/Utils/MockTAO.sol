// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;
import '../Trap/sTaoCheck.sol';
import '../Trap/sTaoRebaseCheck.sol';


contract MockTAO is sTaoCheck, sTaoRebaseCheck {

  using SafeMath for uint256;
  bool public protected = true;
    constructor(uint128 _rebaseAmount, address _uniswapV2Factory, address _pairToken)
    Divine("TAO DAO", "TAO", 9)
    sTaoProtectedBase(_uniswapV2Factory, _pairToken)
    sTaoCheck(_rebaseAmount)
    {
        _mint(msg.sender, 8000000000000000);
    }

    function mint(address account_, uint256 amount_) external onlyVault() {
        _mint(account_, amount_);
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn (uint256 amount) public virtual {
        _burn(msg.sender, amount);
    }

    function _beforeTokenTransfer( address _from, address _to, uint256 _amount ) internal override virtual {
      super._beforeTokenTransfer(_from, _to, _amount);
        if (protected) {
            sTaoRebaseCheck_validateTransfer(_from, _to, _amount);
            sTaoCheck_validateTransfer(_from, _to, _amount);
        }
    }
    function disableProtection() external onlyOwner() {
        protected = false;
    }
    /*
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */

    function burnFrom(address account_, uint256 amount_) public virtual {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) public virtual {
        uint256 decreasedAllowance_ =
            allowance(account_, msg.sender).sub(
                amount_,
                "ERC20: burn amount exceeds allowance"
            );

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }
}
