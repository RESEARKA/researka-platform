// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ResearkaToken
 * @dev ERC20 token for the Researka academic publishing platform
 * - 100 million total supply
 * - Initial price of $0.10 per token
 * - Includes burning capability for buyback mechanism
 * - Role-based access control for platform governance
 */
contract ResearkaToken is ERC20, ERC20Burnable, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens with 18 decimals
    
    // Tracking total minted to enforce max supply
    uint256 private _totalMinted;
    
    // Fee configuration
    uint256 public transactionFeeRate = 100; // 1% = 100 basis points
    address public feeCollector;
    
    // Events
    event FeeRateChanged(uint256 oldRate, uint256 newRate);
    event FeeCollectorChanged(address oldCollector, address newCollector);

    /**
     * @dev Constructor that gives the msg.sender all existing tokens.
     * Initial allocation:
     * - 3% to founder (3 million tokens)
     * - Rest allocated to treasury for distribution
     */
    constructor(address treasuryAddress) ERC20("Researka Token", "RSK") {
        require(treasuryAddress != address(0), "Treasury address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        feeCollector = treasuryAddress;
        
        // Mint 3% to founder (msg.sender)
        uint256 founderAllocation = (MAX_SUPPLY * 3) / 100;
        _mint(msg.sender, founderAllocation);
        _totalMinted += founderAllocation;
        
        // Mint remaining tokens to treasury
        uint256 treasuryAllocation = MAX_SUPPLY - founderAllocation;
        _mint(treasuryAddress, treasuryAllocation);
        _totalMinted += treasuryAllocation;
    }

    /**
     * @dev Pauses all token transfers.
     * Requirements:
     * - Caller must have PAUSER_ROLE
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     * Requirements:
     * - Caller must have PAUSER_ROLE
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     * Requirements:
     * - Caller must have MINTER_ROLE
     * - Total supply must not exceed MAX_SUPPLY
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(_totalMinted + amount <= MAX_SUPPLY, "Exceeds maximum token supply");
        _mint(to, amount);
        _totalMinted += amount;
    }
    
    /**
     * @dev Updates the transaction fee rate.
     * Requirements:
     * - Caller must have GOVERNANCE_ROLE
     * - New rate must be <= 200 (2%)
     */
    function setTransactionFeeRate(uint256 newRate) public onlyRole(GOVERNANCE_ROLE) {
        require(newRate <= 200, "Fee rate cannot exceed 2%");
        uint256 oldRate = transactionFeeRate;
        transactionFeeRate = newRate;
        emit FeeRateChanged(oldRate, newRate);
    }
    
    /**
     * @dev Updates the fee collector address.
     * Requirements:
     * - Caller must have GOVERNANCE_ROLE
     * - New address cannot be zero
     */
    function setFeeCollector(address newCollector) public onlyRole(GOVERNANCE_ROLE) {
        require(newCollector != address(0), "Fee collector cannot be zero address");
        address oldCollector = feeCollector;
        feeCollector = newCollector;
        emit FeeCollectorChanged(oldCollector, newCollector);
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens.
     * Implements the transaction fee mechanism.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip fee for minting, burning, and transfers to/from fee collector
        if (from == address(0) || to == address(0) || 
            from == feeCollector || to == feeCollector) {
            return;
        }
        
        // Calculate and transfer fee
        uint256 feeAmount = (amount * transactionFeeRate) / 10000; // basis points
        if (feeAmount > 0) {
            super._beforeTokenTransfer(from, feeCollector, feeAmount);
            super._transfer(from, feeCollector, feeAmount);
        }
    }
}
