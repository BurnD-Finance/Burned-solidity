// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;


interface ILottery {
    function addToLottery(address account) external;

    function removeFromLottery(address account) external;

    function setMaxPrizePool(uint256 _maxPrizePool) external;

    function lottery() external;

    function setNewRandomizeContract(address _randomizeContract) external;

    function isEligible(address account) external view returns (bool);

    function getWinners() external view returns (address[] memory);

    function getContractBalance() external view returns (uint256);

    /**
     * @dev Emitted when a `winner` has been drawn to win the prize `value`
     *
     * Note that `value` cannot be zero.
     */
    event Lottery(address indexed winner, uint256 value, uint256 timestamp);

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

    /**
     * @dev Emitted when `RandomizeContract` is updated
     */
    event UpdateRandomizeContract(
        address indexed oldContract,
        address indexed newContract
    );
}
