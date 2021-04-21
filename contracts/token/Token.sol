// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./ERC20.sol";

contract Token is ERC20 {
    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All three of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {
        _mint(_msgSender(), 1_000_000 * 1E18);
    }
}
