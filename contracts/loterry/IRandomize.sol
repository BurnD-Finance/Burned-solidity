// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

interface IRandomize {
    function getEthPrice() external view returns (int256);

    function getCakePrice() external view returns (int256);

    function getBnbPrice() external view returns (int256);

    function randomize(uint256) external view returns (uint256);
}
