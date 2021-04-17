// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IRandomize.sol";
import "../interfaces/AggregatorV3Interface.sol";

contract Randomize is IRandomize {

    //BSC ETH:USD = 0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e
    AggregatorV3Interface internal ethPriceFeed =
        AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);

    //BSC BNB:USD = 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
    AggregatorV3Interface internal bnbPriceFeed =
        AggregatorV3Interface(0x8993ED705cdf5e84D0a3B754b5Ee0e1783fcdF16);

    //BSC CAKE:USD = 0xcB23da9EA243f53194CBc2380A6d4d9bC046161f
    AggregatorV3Interface internal cakePriceFeed =
        AggregatorV3Interface(0xd04647B7CB523bb9f26730E9B6dE1174db7591Ad);

    /**
     * Returns the latest price
     * Network: Binance Smart Chain
     * Aggregator: ETH/USD
     * Address: 0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e
     */
    function getEthPrice() public view override returns (int256) {
        (, int256 price, , , ) = ethPriceFeed.latestRoundData();
        return price;
    }

    /**
     * Returns the latest price
     * Network: Binance Smart Chain
     * Aggregator: BNB/USD
     * Address: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
     */
    function getBnbPrice() public view override returns (int256) {
        (, int256 price, , , ) = bnbPriceFeed.latestRoundData();
        return price;
    }

    /**
     * Returns the latest price
     * Network: Binance Smart Chain
     * Aggregator: CAKE/USD
     * Address: 0xcB23da9EA243f53194CBc2380A6d4d9bC046161f
     */
    function getCakePrice() public view override returns (int256) {
        (, int256 price, , , ) = cakePriceFeed.latestRoundData();
        return price;
    }

    function randomize(uint256 length)
        external
        view
        override
        returns (uint256)
    {
        return (uint256(
            keccak256(
                abi.encodePacked(
                    block.difficulty,
                    block.timestamp,
                    length

//                    getBnbPrice(),
//                    getCakePrice(),
//                    getEthPrice()
                )
            )
        ) % length);
    }
}
