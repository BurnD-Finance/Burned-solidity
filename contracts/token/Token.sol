// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "../access/Ownable.sol";
//import "../interfaces/IUniswapV2Pair.sol";
//import "../interfaces/IUniswapV2Factory.sol";
//import "../interfaces/IUniswapV2Router02.sol";
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

        //        IUniswapV2Router02 _uniswapV2Router =
        //            IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        //        // Create a uniswap pair for this new token
        //        uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory())
        //            .createPair(address(this), _uniswapV2Router.WETH());
        //
        //        // set the rest of the contract variables
        //        uniswapV2Router = _uniswapV2Router;

        //exclude owner and this contract from fee

        //        emit Transfer(address(0), _msgSender(), _tTotal);
    }

    //to recieve ETH from uniswapV2Router when swaping
    receive() external payable {}
}
