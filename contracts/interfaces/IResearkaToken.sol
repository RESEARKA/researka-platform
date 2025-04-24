// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IResearkaToken
 * @dev Interface for minimal integration with external RESEARKA token
 * This allows for basic interactions without implementing the full token contract
 */
interface IResearkaToken {
    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Returns the amount of tokens that `spender` can spend on behalf of `owner`.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Returns the number of decimals used for token display.
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Returns the token symbol (e.g., "RSCH").
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     * Returns a boolean value indicating whether the operation succeeded.
     */
    function approve(address spender, uint256 amount) external returns (bool);
}
