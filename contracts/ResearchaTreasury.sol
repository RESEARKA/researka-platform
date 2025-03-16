// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title ResearchaTreasury
 * @dev Manages the treasury operations for the Researka platform
 * - Handles buyback mechanism to maintain price stability
 * - Manages staking rewards and distribution
 * - Controls platform fee adjustments
 */
contract ResearchaTreasury is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // Token contract
    IERC20 public researchToken;
    
    // Price feed for ETH/USD for dynamic calculations
    AggregatorV3Interface public priceFeed;
    
    // Buyback configuration
    uint256 public buybackFloorPriceCents = 9; // $0.09 (90% of initial $0.10 price)
    bool public buybackEnabled = true;
    
    // Staking configuration
    uint256 public stakingRewardRate = 1500; // 15% annual yield (in basis points)
    uint256 public minStakingPeriod = 30 days;
    uint256 public maxStakingPeriod = 365 days;
    uint256 public stakingRewardBoostPerMonth = 50; // 0.5% boost per month staked (in basis points)
    
    // Fee configuration
    uint256 public transactionFeeRate = 100; // 1% (in basis points)
    uint256 public maxFeeRate = 200; // 2% maximum (in basis points)
    
    // Staking data structure
    struct StakingPosition {
        address staker;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        bool active;
    }
    
    // Mapping from staking ID to StakingPosition
    mapping(uint256 => StakingPosition) public stakingPositions;
    uint256 public stakingPositionCount;
    
    // Mapping from staker address to their staking IDs
    mapping(address => uint256[]) public stakerPositions;
    
    // Events
    event BuybackExecuted(uint256 tokenAmount, uint256 ethAmount);
    event StakingPositionCreated(uint256 indexed positionId, address indexed staker, uint256 amount, uint256 endTime);
    event StakingRewardClaimed(uint256 indexed positionId, address indexed staker, uint256 amount);
    event StakingPositionClosed(uint256 indexed positionId, address indexed staker, uint256 amount);
    event TransactionFeeRateChanged(uint256 oldRate, uint256 newRate);
    event BuybackStatusChanged(bool enabled);
    event BuybackFloorPriceChanged(uint256 oldPrice, uint256 newPrice);
    
    /**
     * @dev Constructor
     * @param _token Address of the Researka token contract
     * @param _priceFeed Address of the Chainlink ETH/USD price feed
     */
    constructor(
        address _token,
        address _priceFeed
    ) {
        require(_token != address(0), "Token address cannot be zero");
        require(_priceFeed != address(0), "Price feed address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        researchToken = IERC20(_token);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    
    /**
     * @dev Execute buyback if token price is below floor
     * @param _tokenAmount Amount of tokens to buy back
     */
    function executeBuyback(uint256 _tokenAmount) external payable onlyRole(ADMIN_ROLE) nonReentrant {
        require(buybackEnabled, "Buyback is disabled");
        require(_tokenAmount > 0, "Token amount must be greater than zero");
        require(msg.value > 0, "ETH amount must be greater than zero");
        
        // Calculate current token price in USD cents
        uint256 currentPriceCents = calculateTokenPriceInCents(msg.value, _tokenAmount);
        
        // Verify price is below floor
        require(currentPriceCents < buybackFloorPriceCents, "Current price is above floor");
        
        // Transfer tokens to treasury
        // Note: In a real implementation, this would interact with a DEX or liquidity pool
        // For simplicity, we're assuming direct transfer from a seller
        researchToken.safeTransferFrom(msg.sender, address(this), _tokenAmount);
        
        emit BuybackExecuted(_tokenAmount, msg.value);
    }
    
    /**
     * @dev Calculate token price in USD cents
     * @param _ethAmount Amount of ETH
     * @param _tokenAmount Amount of tokens
     * @return priceCents Token price in USD cents
     */
    function calculateTokenPriceInCents(uint256 _ethAmount, uint256 _tokenAmount) public view returns (uint256) {
        // Get ETH/USD price from Chainlink
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed data");
        
        // Calculate ETH value in USD cents
        // price is ETH/USD with 8 decimals, so $1 = 100000000
        uint256 ethValueCents = (uint256(price) * _ethAmount) / 10**6; // Result in cents
        
        // Calculate token price in USD cents
        uint256 priceCents = (ethValueCents * 10**18) / _tokenAmount;
        
        return priceCents;
    }
    
    /**
     * @dev Create a new staking position
     * @param _amount Amount of tokens to stake
     * @param _stakingPeriod Duration of staking in seconds
     * @return positionId ID of the created staking position
     */
    function createStakingPosition(uint256 _amount, uint256 _stakingPeriod) external nonReentrant returns (uint256) {
        require(_amount > 0, "Stake amount must be greater than zero");
        require(_stakingPeriod >= minStakingPeriod, "Staking period too short");
        require(_stakingPeriod <= maxStakingPeriod, "Staking period too long");
        
        // Transfer tokens from staker to treasury
        researchToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Create staking position
        uint256 positionId = stakingPositionCount;
        uint256 endTime = block.timestamp + _stakingPeriod;
        
        stakingPositions[positionId] = StakingPosition({
            staker: msg.sender,
            amount: _amount,
            startTime: block.timestamp,
            endTime: endTime,
            lastClaimTime: block.timestamp,
            active: true
        });
        
        // Update mappings
        stakerPositions[msg.sender].push(positionId);
        stakingPositionCount++;
        
        emit StakingPositionCreated(positionId, msg.sender, _amount, endTime);
        
        return positionId;
    }
    
    /**
     * @dev Claim staking rewards for a position
     * @param _positionId ID of the staking position
     * @return rewardAmount Amount of rewards claimed
     */
    function claimStakingReward(uint256 _positionId) external nonReentrant returns (uint256) {
        require(_positionId < stakingPositionCount, "Position does not exist");
        
        StakingPosition storage position = stakingPositions[_positionId];
        require(position.staker == msg.sender, "Not position owner");
        require(position.active, "Position not active");
        
        // Calculate reward
        uint256 rewardAmount = calculateStakingReward(_positionId);
        require(rewardAmount > 0, "No rewards to claim");
        
        // Update last claim time
        position.lastClaimTime = block.timestamp;
        
        // Transfer rewards
        researchToken.safeTransfer(msg.sender, rewardAmount);
        
        emit StakingRewardClaimed(_positionId, msg.sender, rewardAmount);
        
        return rewardAmount;
    }
    
    /**
     * @dev Close a staking position and withdraw tokens
     * @param _positionId ID of the staking position
     */
    function closeStakingPosition(uint256 _positionId) external nonReentrant {
        require(_positionId < stakingPositionCount, "Position does not exist");
        
        StakingPosition storage position = stakingPositions[_positionId];
        require(position.staker == msg.sender, "Not position owner");
        require(position.active, "Position not active");
        
        // Check if staking period has ended
        require(block.timestamp >= position.endTime, "Staking period not ended");
        
        // Calculate final reward
        uint256 rewardAmount = calculateStakingReward(_positionId);
        
        // Mark position as inactive
        position.active = false;
        
        // Transfer principal and rewards
        uint256 totalAmount = position.amount + rewardAmount;
        researchToken.safeTransfer(msg.sender, totalAmount);
        
        emit StakingPositionClosed(_positionId, msg.sender, totalAmount);
    }
    
    /**
     * @dev Calculate staking reward for a position
     * @param _positionId ID of the staking position
     * @return rewardAmount Amount of rewards accrued
     */
    function calculateStakingReward(uint256 _positionId) public view returns (uint256) {
        StakingPosition storage position = stakingPositions[_positionId];
        if (!position.active) return 0;
        
        // Calculate time elapsed since last claim
        uint256 timeElapsed = block.timestamp - position.lastClaimTime;
        if (timeElapsed == 0) return 0;
        
        // Calculate base reward rate
        uint256 baseRate = stakingRewardRate;
        
        // Add boost based on staking duration
        uint256 monthsStaked = (block.timestamp - position.startTime) / 30 days;
        uint256 boost = monthsStaked * stakingRewardBoostPerMonth;
        
        // Cap boost at 12 months
        if (boost > 600) boost = 600; // Max 6% boost (12 months * 0.5%)
        
        uint256 effectiveRate = baseRate + boost;
        
        // Calculate reward: principal * rate * timeElapsed / (365 days * 10000)
        // Rate is in basis points (15% = 1500)
        uint256 rewardAmount = (position.amount * effectiveRate * timeElapsed) / (365 days * 10000);
        
        return rewardAmount;
    }
    
    /**
     * @dev Set transaction fee rate
     * @param _newRate New fee rate in basis points
     */
    function setTransactionFeeRate(uint256 _newRate) external onlyRole(GOVERNANCE_ROLE) {
        require(_newRate <= maxFeeRate, "Fee rate exceeds maximum");
        
        uint256 oldRate = transactionFeeRate;
        transactionFeeRate = _newRate;
        
        emit TransactionFeeRateChanged(oldRate, _newRate);
    }
    
    /**
     * @dev Set buyback floor price
     * @param _newFloorPriceCents New floor price in USD cents
     */
    function setBuybackFloorPrice(uint256 _newFloorPriceCents) external onlyRole(GOVERNANCE_ROLE) {
        uint256 oldPrice = buybackFloorPriceCents;
        buybackFloorPriceCents = _newFloorPriceCents;
        
        emit BuybackFloorPriceChanged(oldPrice, _newFloorPriceCents);
    }
    
    /**
     * @dev Enable or disable buyback mechanism
     * @param _enabled Whether buyback should be enabled
     */
    function setBuybackEnabled(bool _enabled) external onlyRole(GOVERNANCE_ROLE) {
        buybackEnabled = _enabled;
        
        emit BuybackStatusChanged(_enabled);
    }
    
    /**
     * @dev Set staking reward rate
     * @param _newRate New reward rate in basis points
     */
    function setStakingRewardRate(uint256 _newRate) external onlyRole(GOVERNANCE_ROLE) {
        require(_newRate <= 3000, "Reward rate too high"); // Max 30%
        stakingRewardRate = _newRate;
    }
    
    /**
     * @dev Set staking period limits
     * @param _minPeriod Minimum staking period in seconds
     * @param _maxPeriod Maximum staking period in seconds
     */
    function setStakingPeriodLimits(uint256 _minPeriod, uint256 _maxPeriod) external onlyRole(GOVERNANCE_ROLE) {
        require(_minPeriod <= _maxPeriod, "Min period exceeds max period");
        require(_maxPeriod <= 730 days, "Max period too long"); // Max 2 years
        
        minStakingPeriod = _minPeriod;
        maxStakingPeriod = _maxPeriod;
    }
    
    /**
     * @dev Get staking positions for a staker
     * @param _staker Address of the staker
     * @return Array of staking position IDs
     */
    function getStakerPositions(address _staker) external view returns (uint256[] memory) {
        return stakerPositions[_staker];
    }
    
    /**
     * @dev Withdraw ETH from treasury (admin only)
     * @param _to Address to send ETH to
     * @param _amount Amount of ETH to withdraw
     */
    function withdrawETH(address payable _to, uint256 _amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0 && _amount <= address(this).balance, "Invalid amount");
        
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "ETH transfer failed");
    }
    
    /**
     * @dev Withdraw tokens from treasury (admin only)
     * @param _to Address to send tokens to
     * @param _amount Amount of tokens to withdraw
     */
    function withdrawTokens(address _to, uint256 _amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Invalid amount");
        
        researchToken.safeTransfer(_to, _amount);
    }
    
    // Allow treasury to receive ETH
    receive() external payable {}
}
