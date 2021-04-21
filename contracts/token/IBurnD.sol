// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IBurnD {
    /**
     * @dev Emitted when `burnFee` is updated
     *
     * Note that `value` may be zero.
     */
    event UpdatedBurnFee(uint8 oldBurnFee, uint8 newBurnFee);

    /**
     * @dev Emitted when `lotteryFee` is updated
     *
     * Note that `value` may be zero.
     */
    event UpdatedLotteryFee(uint8 oldLotteryFee, uint8 newLotteryFee);

    /**
     * @dev Emitted when `liquidityFee` is updated
     *
     * Note that `value` may be zero.
     */
    event UpdatedLiquidityFee(uint8 oldLiquidityFee, uint8 newLiquidityFee);

    /**
     * @dev Emitted when `charityFee` is updated
     *
     * Note that `value` may be zero.
     */
    event UpdatedCharityFee(uint8 oldCharityFee, uint8 newCharityFee);

    /**
     * @dev Emitted when contract receive ETH
     */
    event Received(address sender, uint256 value);

    /**
     * @dev Emitted when contract burns LP Tokens
     */
    event BurnedLPTokens(address recipient, uint256 value);
}
