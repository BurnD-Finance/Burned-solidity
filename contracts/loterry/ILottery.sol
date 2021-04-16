// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ILottery {
    function addToLottery(address account) external;

    function removeFromLottery(address account) external;

    function isEligible(address account) external view returns (bool);

    function getArray() external view returns (address[] memory);

    function lottery() external;

    function getEthPrice() external view returns (int256);

    function getCakePrice() external view returns (int256);

    function getBnbPrice() external view returns (int256);

    function getContractBalance() external view returns (uint256);

    /**
     * @dev Emitted when a `winner` has been drawn to win the prize `value`
     *
     * Note that `value` cannot be zero.
     */
    event Lottery(address indexed winner, uint256 value);

    /**
     * @dev Emitted when `account` is added
     * to the list of players eligible for the lottery
     */
    event AddToLottery(address indexed account);

    /**
     * @dev Emitted when `account` is removed
     * from the list of players eligible for the lottery
     */
    event RemoveFromLottery(address indexed account);
}
