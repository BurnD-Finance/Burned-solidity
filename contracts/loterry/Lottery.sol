// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./ILottery.sol";
import "../token/IERC20.sol";
import "../interfaces/AggregatorV3Interface.sol";

contract Lottery is ILottery {
    address[] private eligibleForLottery;

    AggregatorV3Interface internal ethPriceFeed =
        AggregatorV3Interface(0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8);
    AggregatorV3Interface internal bnbPriceFeed =
        AggregatorV3Interface(0xc546d2d06144F9DD42815b8bA46Ee7B8FcAFa4a2);
    AggregatorV3Interface internal cakePriceFeed =
        AggregatorV3Interface(0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c);

    address private immutable BurnDContract;

    uint maxPrizePool;

    /**
     * Returns the latest price
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    function getEthPrice() public view override returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = ethPriceFeed.latestRoundData();
        return price;
    }

    /**
     * Returns the latest price
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    function getCakePrice() public view override returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = cakePriceFeed.latestRoundData();
        return price;
    }

    /**
     * Returns the latest price
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     */
    function getBnbPrice() public view override returns (int256) {
        (
            uint80 roundID,
            int256 price,
            uint256 startedAt,
            uint256 timeStamp,
            uint80 answeredInRound
        ) = bnbPriceFeed.latestRoundData();
        return price;
    }

    modifier onlyBurnD {
        require(
            msg.sender == BurnDContract,
            "Only BurnD contract can call this function"
        );
        _;
    }

    constructor(address BurnDContract_) {
        BurnDContract = BurnDContract_;
        maxPrizePool = 5000 * 1E18;
    }

    function lottery() external override {
        uint256 contractBalance = getContractBalance();
        if (getContractBalance() > maxPrizePool) {
            uint256 index =
                uint256(
                    keccak256(
                        abi.encodePacked(
                            block.difficulty,
                            block.timestamp,
                            eligibleForLottery.length
                        )
                    )
                ) % eligibleForLottery.length;
            if (eligibleForLottery[index] != address(0)) {
                IERC20(BurnDContract).transfer(
                    eligibleForLottery[index],
                    contractBalance
                );
            }
        }
    }

    function addToLottery(address account) external override onlyBurnD {
        if (!isEligible(account)) {
            eligibleForLottery.push(account);
        }
    }

    function removeFromLottery(address account) external override onlyBurnD {
        if (isEligible(account)) {
            uint256 index = _getAccountIndex(account);
            _removeFromEligibility(index);
        }
    }

    function getContractBalance() public view override returns (uint256) {
        return IERC20(BurnDContract).balanceOf(address(this));
    }

    function _getAccountIndex(address account) internal view returns (uint256) {
        uint256 length = eligibleForLottery.length;
        for (uint256 i = 0; i < length; i++) {
            if (eligibleForLottery[i] == account) {
                return i;
            }
        }
        revert("Lottery: Account not present in the list");
    }

    function _removeFromEligibility(uint256 index) internal {
        uint256 length = eligibleForLottery.length;

        for (uint256 i = index; i < length - 1; i++) {
            eligibleForLottery[i] = eligibleForLottery[i + 1];
        }
        eligibleForLottery.pop();
    }

    function isEligible(address account) public view override returns (bool) {
        uint256 length = eligibleForLottery.length;
        for (uint256 i = 0; i < length; i++) {
            if (eligibleForLottery[i] == account) {
                return true;
            }
        }
        return false;
    }

    function getArray() external view override returns (address[] memory) {
        return eligibleForLottery;
    }
}
