// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title ResearkaSubmission
 * @dev Manages article submissions and associated metadata on the Researka platform
 * - Handles submission fees with dynamic pricing
 * - Stores article metadata and IPFS content hashes
 * - Manages the review process status
 */
contract ResearkaSubmission is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    
    // Token contract
    IERC20 public researchToken;
    
    // Price feed for ETH/USD for dynamic fee calculation
    AggregatorV3Interface public priceFeed;
    
    // Fee configuration in USD cents (e.g., 1000 = $10.00)
    uint256 public submissionFeeCents = 0; // Initially free
    uint256 public constant MAX_FEE_CENTS = 3000; // $30.00 maximum
    
    // Platform treasury
    address public treasury;
    
    // Article submission data
    struct Article {
        address author;
        string metadataHash;    // IPFS hash for article metadata (title, abstract, etc.)
        string contentHash;     // IPFS hash for full article content
        uint256 submissionTime;
        ArticleStatus status;
        uint256 reviewCount;
        uint256 acceptedReviews;
        uint256 rejectedReviews;
        bool isPaid;            // Whether submission fee has been paid
    }
    
    enum ArticleStatus {
        Submitted,
        InReview,
        Accepted,
        Rejected,
        Published
    }
    
    // Mapping from article ID to Article data
    mapping(uint256 => Article) public articles;
    uint256 public articleCount;
    
    // Author's articles
    mapping(address => uint256[]) public authorArticles;
    
    // Events
    event ArticleSubmitted(uint256 indexed articleId, address indexed author, string metadataHash);
    event ArticleStatusChanged(uint256 indexed articleId, ArticleStatus newStatus);
    event SubmissionFeePaid(uint256 indexed articleId, address indexed payer, uint256 amount);
    event SubmissionFeeChanged(uint256 oldFeeCents, uint256 newFeeCents);
    
    /**
     * @dev Constructor
     * @param _token Address of the Researka token contract
     * @param _priceFeed Address of the Chainlink ETH/USD price feed
     * @param _treasury Address of the platform treasury
     */
    constructor(
        address _token,
        address _priceFeed,
        address _treasury
    ) {
        require(_token != address(0), "Token address cannot be zero");
        require(_priceFeed != address(0), "Price feed address cannot be zero");
        require(_treasury != address(0), "Treasury address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
        
        researchToken = IERC20(_token);
        priceFeed = AggregatorV3Interface(_priceFeed);
        treasury = _treasury;
    }
    
    /**
     * @dev Submit a new article
     * @param _metadataHash IPFS hash of article metadata
     * @param _contentHash IPFS hash of article content
     * @return articleId The ID of the newly submitted article
     */
    function submitArticle(
        string memory _metadataHash,
        string memory _contentHash
    ) external nonReentrant returns (uint256) {
        require(bytes(_metadataHash).length > 0, "Metadata hash cannot be empty");
        require(bytes(_contentHash).length > 0, "Content hash cannot be empty");
        
        uint256 articleId = articleCount;
        
        articles[articleId] = Article({
            author: msg.sender,
            metadataHash: _metadataHash,
            contentHash: _contentHash,
            submissionTime: block.timestamp,
            status: ArticleStatus.Submitted,
            reviewCount: 0,
            acceptedReviews: 0,
            rejectedReviews: 0,
            isPaid: submissionFeeCents == 0 // Free if no fee is set
        });
        
        authorArticles[msg.sender].push(articleId);
        articleCount++;
        
        emit ArticleSubmitted(articleId, msg.sender, _metadataHash);
        
        // If submission fee is required, article starts in Submitted state
        // Otherwise, it automatically moves to InReview
        if (submissionFeeCents == 0) {
            _updateArticleStatus(articleId, ArticleStatus.InReview);
        }
        
        return articleId;
    }
    
    /**
     * @dev Pay submission fee for an article
     * @param _articleId ID of the article
     */
    function paySubmissionFee(uint256 _articleId) external nonReentrant {
        require(_articleId < articleCount, "Article does not exist");
        Article storage article = articles[_articleId];
        
        require(article.author == msg.sender, "Only author can pay fee");
        require(!article.isPaid, "Submission fee already paid");
        require(submissionFeeCents > 0, "No submission fee required");
        
        // Calculate token amount based on current ETH/USD price
        uint256 tokenAmount = getTokenAmountForFee();
        
        // Transfer tokens from author to treasury
        require(
            researchToken.transferFrom(msg.sender, treasury, tokenAmount),
            "Token transfer failed"
        );
        
        article.isPaid = true;
        
        emit SubmissionFeePaid(_articleId, msg.sender, tokenAmount);
        
        // Move article to InReview status
        _updateArticleStatus(_articleId, ArticleStatus.InReview);
    }
    
    /**
     * @dev Update article status (restricted to platform role)
     * @param _articleId ID of the article
     * @param _status New status
     */
    function updateArticleStatus(uint256 _articleId, ArticleStatus _status) 
        external 
        onlyRole(PLATFORM_ROLE) 
    {
        require(_articleId < articleCount, "Article does not exist");
        _updateArticleStatus(_articleId, _status);
    }
    
    /**
     * @dev Internal function to update article status
     */
    function _updateArticleStatus(uint256 _articleId, ArticleStatus _status) internal {
        Article storage article = articles[_articleId];
        
        // Validate status transitions
        if (_status == ArticleStatus.InReview) {
            require(
                article.status == ArticleStatus.Submitted && article.isPaid, 
                "Invalid status transition or fee not paid"
            );
        } else if (_status == ArticleStatus.Published) {
            require(
                article.status == ArticleStatus.Accepted, 
                "Only accepted articles can be published"
            );
        }
        
        article.status = _status;
        emit ArticleStatusChanged(_articleId, _status);
    }
    
    /**
     * @dev Set submission fee in USD cents
     * @param _feeCents New fee in USD cents
     */
    function setSubmissionFee(uint256 _feeCents) external onlyRole(ADMIN_ROLE) {
        require(_feeCents <= MAX_FEE_CENTS, "Fee exceeds maximum allowed");
        
        uint256 oldFee = submissionFeeCents;
        submissionFeeCents = _feeCents;
        
        emit SubmissionFeeChanged(oldFee, _feeCents);
    }
    
    /**
     * @dev Get token amount required for current submission fee
     * @return tokenAmount Amount of tokens needed
     */
    function getTokenAmountForFee() public view returns (uint256) {
        if (submissionFeeCents == 0) return 0;
        
        // Get ETH/USD price from Chainlink
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed data");
        
        // Convert USD cents to ETH
        // price is ETH/USD with 8 decimals, so $1 = 100000000
        // submissionFeeCents is in cents, so $10 = 1000
        uint256 ethAmount = (submissionFeeCents * 10**16) / uint256(price); // Result in wei
        
        // Convert ETH amount to token amount
        // Assuming 1 ETH = 10000 tokens initially ($0.10 per token at $1000 ETH)
        uint256 tokenAmount = ethAmount * 10000;
        
        return tokenAmount;
    }
    
    /**
     * @dev Get articles by author
     * @param _author Address of the author
     * @return Array of article IDs
     */
    function getAuthorArticles(address _author) external view returns (uint256[] memory) {
        return authorArticles[_author];
    }
    
    /**
     * @dev Update treasury address
     * @param _newTreasury New treasury address
     */
    function setTreasury(address _newTreasury) external onlyRole(ADMIN_ROLE) {
        require(_newTreasury != address(0), "Treasury cannot be zero address");
        treasury = _newTreasury;
    }
}
