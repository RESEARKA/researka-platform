// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ResearkaSubmission.sol";

/**
 * @title ResearkaReview
 * @dev Manages the peer review process for the Researka platform
 * - Handles reviewer assignments and submissions
 * - Manages review rewards and incentives
 * - Tracks citation royalties
 */
contract ResearkaReview is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    
    // Token contract
    IERC20 public researchToken;
    
    // Submission contract
    ResearkaSubmission public submissionContract;
    
    // Platform treasury
    address public treasury;
    
    // Review reward configuration
    uint256 public reviewRewardAmount = 50 * 10**18; // 50 tokens per review
    
    // Citation royalty configuration
    uint256 public citationRoyaltyAmount = 5 * 10**17; // 0.5 tokens per citation ($0.05 at $0.10/token)
    uint256 public citationRoyaltyCap = 2500 * 10**18; // 2500 tokens per article per year ($250 at $0.10/token)
    
    // Review data structure
    struct Review {
        uint256 articleId;
        address reviewer;
        string reviewHash;      // IPFS hash for review content
        uint256 submissionTime;
        bool isAccepted;        // Whether the review recommends acceptance
        bool isRewarded;        // Whether the reviewer has been rewarded
    }
    
    // Reviewer assignment data
    struct ReviewerAssignment {
        address reviewer;
        uint256 assignedTime;
        uint256 deadline;
        bool completed;
    }
    
    // Citation data
    struct Citation {
        uint256 citedArticleId;
        uint256 citingArticleId;
        uint256 timestamp;
        bool isPaid;
    }
    
    // Mapping from review ID to Review data
    mapping(uint256 => Review) public reviews;
    uint256 public reviewCount;
    
    // Mapping from article ID to reviewer assignments
    mapping(uint256 => ReviewerAssignment[]) public articleReviewers;
    
    // Mapping from article ID to its reviews
    mapping(uint256 => uint256[]) public articleReviews;
    
    // Mapping from reviewer address to their reviews
    mapping(address => uint256[]) public reviewerReviews;
    
    // Citation tracking
    mapping(uint256 => Citation[]) public articleCitations; // Citations received by an article
    mapping(uint256 => uint256) public articleYearlyCitationCount; // Yearly citation count for royalty cap
    mapping(uint256 => uint256) public articleYearlyCitationPaid; // Yearly citation royalties paid
    
    // Events
    event ReviewerAssigned(uint256 indexed articleId, address indexed reviewer, uint256 deadline);
    event ReviewSubmitted(uint256 indexed reviewId, uint256 indexed articleId, address indexed reviewer);
    event ReviewerRewarded(address indexed reviewer, uint256 indexed reviewId, uint256 amount);
    event CitationRecorded(uint256 indexed citedArticleId, uint256 indexed citingArticleId);
    event CitationRoyaltyPaid(uint256 indexed articleId, address indexed author, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _token Address of the Researka token contract
     * @param _submission Address of the ResearkaSubmission contract
     * @param _treasury Address of the platform treasury
     */
    constructor(
        address _token,
        address _submission,
        address _treasury
    ) {
        require(_token != address(0), "Token address cannot be zero");
        require(_submission != address(0), "Submission address cannot be zero");
        require(_treasury != address(0), "Treasury address cannot be zero");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
        
        researchToken = IERC20(_token);
        submissionContract = ResearkaSubmission(_submission);
        treasury = _treasury;
    }
    
    /**
     * @dev Assign a reviewer to an article (platform only)
     * @param _articleId ID of the article
     * @param _reviewer Address of the reviewer
     * @param _deadlineDays Number of days until review deadline
     */
    function assignReviewer(
        uint256 _articleId,
        address _reviewer,
        uint256 _deadlineDays
    ) external onlyRole(PLATFORM_ROLE) {
        require(_reviewer != address(0), "Reviewer address cannot be zero");
        require(_deadlineDays > 0, "Deadline must be greater than zero");
        
        // Get article data to verify it exists and is in review
        (address author, , , , ResearkaSubmission.ArticleStatus status, , , , ) = 
            submissionContract.articles(_articleId);
            
        require(author != address(0), "Article does not exist");
        require(status == ResearkaSubmission.ArticleStatus.InReview, "Article not in review state");
        require(author != _reviewer, "Author cannot review their own article");
        
        // Create reviewer assignment
        ReviewerAssignment memory assignment = ReviewerAssignment({
            reviewer: _reviewer,
            assignedTime: block.timestamp,
            deadline: block.timestamp + (_deadlineDays * 1 days),
            completed: false
        });
        
        articleReviewers[_articleId].push(assignment);
        
        emit ReviewerAssigned(_articleId, _reviewer, assignment.deadline);
    }
    
    /**
     * @dev Submit a review for an article
     * @param _articleId ID of the article
     * @param _reviewHash IPFS hash of review content
     * @param _isAccepted Whether the review recommends acceptance
     * @return reviewId The ID of the submitted review
     */
    function submitReview(
        uint256 _articleId,
        string memory _reviewHash,
        bool _isAccepted
    ) external nonReentrant returns (uint256) {
        require(bytes(_reviewHash).length > 0, "Review hash cannot be empty");
        
        // Verify the reviewer is assigned to this article
        bool isAssigned = false;
        uint256 assignmentIndex;
        
        ReviewerAssignment[] storage assignments = articleReviewers[_articleId];
        for (uint256 i = 0; i < assignments.length; i++) {
            if (assignments[i].reviewer == msg.sender && !assignments[i].completed) {
                isAssigned = true;
                assignmentIndex = i;
                break;
            }
        }
        
        require(isAssigned, "Not assigned to review this article");
        
        // Mark assignment as completed
        articleReviewers[_articleId][assignmentIndex].completed = true;
        
        // Create the review
        uint256 reviewId = reviewCount;
        reviews[reviewId] = Review({
            articleId: _articleId,
            reviewer: msg.sender,
            reviewHash: _reviewHash,
            submissionTime: block.timestamp,
            isAccepted: _isAccepted,
            isRewarded: false
        });
        
        // Update mappings
        articleReviews[_articleId].push(reviewId);
        reviewerReviews[msg.sender].push(reviewId);
        reviewCount++;
        
        emit ReviewSubmitted(reviewId, _articleId, msg.sender);
        
        // Process review rewards
        _processReviewReward(reviewId);
        
        // Update article review counts
        _updateArticleReviewCounts(_articleId);
        
        return reviewId;
    }
    
    /**
     * @dev Process review reward for a reviewer
     * @param _reviewId ID of the review
     */
    function _processReviewReward(uint256 _reviewId) internal {
        Review storage review = reviews[_reviewId];
        
        // Ensure reward hasn't been processed yet
        if (review.isRewarded) return;
        
        // Transfer tokens from treasury to reviewer
        require(
            researchToken.transferFrom(treasury, review.reviewer, reviewRewardAmount),
            "Token transfer failed"
        );
        
        review.isRewarded = true;
        
        emit ReviewerRewarded(review.reviewer, _reviewId, reviewRewardAmount);
    }
    
    /**
     * @dev Update article review counts and potentially change status
     * @param _articleId ID of the article
     */
    function _updateArticleReviewCounts(uint256 _articleId) internal {
        uint256[] memory articleReviewIds = articleReviews[_articleId];
        uint256 acceptCount = 0;
        uint256 rejectCount = 0;
        
        for (uint256 i = 0; i < articleReviewIds.length; i++) {
            Review storage review = reviews[articleReviewIds[i]];
            if (review.isAccepted) {
                acceptCount++;
            } else {
                rejectCount++;
            }
        }
        
        // Update counts in submission contract (assuming it has a function to update these)
        // This would need to be implemented in the submission contract
        
        // Determine if article should be accepted or rejected based on reviews
        if (articleReviewIds.length >= 3) { // Minimum 3 reviews for decision
            if (acceptCount > rejectCount && acceptCount >= 2) {
                // Accept the article
                submissionContract.updateArticleStatus(_articleId, ResearkaSubmission.ArticleStatus.Accepted);
            } else if (rejectCount > acceptCount && rejectCount >= 2) {
                // Reject the article
                submissionContract.updateArticleStatus(_articleId, ResearkaSubmission.ArticleStatus.Rejected);
            }
        }
    }
    
    /**
     * @dev Record a citation from one article to another
     * @param _citedArticleId ID of the cited article
     * @param _citingArticleId ID of the citing article
     */
    function recordCitation(
        uint256 _citedArticleId,
        uint256 _citingArticleId
    ) external onlyRole(PLATFORM_ROLE) {
        require(_citedArticleId != _citingArticleId, "Article cannot cite itself");
        
        // Get article data to verify both articles exist
        (address citedAuthor, , , , ResearkaSubmission.ArticleStatus citedStatus, , , , ) = 
            submissionContract.articles(_citedArticleId);
            
        (address citingAuthor, , , , ResearkaSubmission.ArticleStatus citingStatus, , , , ) = 
            submissionContract.articles(_citingArticleId);
            
        require(citedAuthor != address(0), "Cited article does not exist");
        require(citingAuthor != address(0), "Citing article does not exist");
        require(citedStatus == ResearkaSubmission.ArticleStatus.Published, "Cited article not published");
        require(citingStatus == ResearkaSubmission.ArticleStatus.Published, "Citing article not published");
        
        // Check if this citation already exists
        Citation[] storage citations = articleCitations[_citedArticleId];
        for (uint256 i = 0; i < citations.length; i++) {
            if (citations[i].citingArticleId == _citingArticleId) {
                return; // Citation already recorded
            }
        }
        
        // Record the citation
        Citation memory newCitation = Citation({
            citedArticleId: _citedArticleId,
            citingArticleId: _citingArticleId,
            timestamp: block.timestamp,
            isPaid: false
        });
        
        articleCitations[_citedArticleId].push(newCitation);
        
        emit CitationRecorded(_citedArticleId, _citingArticleId);
        
        // Process citation royalty
        _processCitationRoyalty(_citedArticleId, citations.length);
    }
    
    /**
     * @dev Process citation royalty for an article
     * @param _articleId ID of the article
     * @param _citationIndex Index of the citation in the article's citations array
     */
    function _processCitationRoyalty(uint256 _articleId, uint256 _citationIndex) internal {
        // Get current year (approximate using block timestamp)
        uint256 currentYear = block.timestamp / 365 days;
        
        // Reset yearly counters if we're in a new year
        if (currentYear > articleYearlyCitationCount[_articleId] / 1000000) {
            articleYearlyCitationCount[_articleId] = currentYear * 1000000;
            articleYearlyCitationPaid[_articleId] = 0;
        }
        
        // Increment citation count for this year
        articleYearlyCitationCount[_articleId]++;
        
        // Check if we've hit the yearly cap
        if (articleYearlyCitationPaid[_articleId] >= citationRoyaltyCap) {
            return; // Yearly cap reached
        }
        
        // Get article author
        (address author, , , , , , , , ) = submissionContract.articles(_articleId);
        
        // Calculate royalty amount (may be reduced if near cap)
        uint256 remainingAllowance = citationRoyaltyCap - articleYearlyCitationPaid[_articleId];
        uint256 paymentAmount = remainingAllowance < citationRoyaltyAmount ? 
                                remainingAllowance : citationRoyaltyAmount;
        
        // Transfer tokens from treasury to author
        if (paymentAmount > 0) {
            require(
                researchToken.transferFrom(treasury, author, paymentAmount),
                "Token transfer failed"
            );
            
            articleYearlyCitationPaid[_articleId] += paymentAmount;
            articleCitations[_articleId][_citationIndex].isPaid = true;
            
            emit CitationRoyaltyPaid(_articleId, author, paymentAmount);
        }
    }
    
    /**
     * @dev Set review reward amount
     * @param _amount New reward amount in tokens
     */
    function setReviewRewardAmount(uint256 _amount) external onlyRole(ADMIN_ROLE) {
        reviewRewardAmount = _amount;
    }
    
    /**
     * @dev Set citation royalty amount
     * @param _amount New royalty amount in tokens
     */
    function setCitationRoyaltyAmount(uint256 _amount) external onlyRole(ADMIN_ROLE) {
        citationRoyaltyAmount = _amount;
    }
    
    /**
     * @dev Set citation royalty yearly cap
     * @param _cap New yearly cap in tokens
     */
    function setCitationRoyaltyCap(uint256 _cap) external onlyRole(ADMIN_ROLE) {
        citationRoyaltyCap = _cap;
    }
    
    /**
     * @dev Update treasury address
     * @param _newTreasury New treasury address
     */
    function setTreasury(address _newTreasury) external onlyRole(ADMIN_ROLE) {
        require(_newTreasury != address(0), "Treasury cannot be zero address");
        treasury = _newTreasury;
    }
    
    /**
     * @dev Get reviews for an article
     * @param _articleId ID of the article
     * @return Array of review IDs
     */
    function getArticleReviews(uint256 _articleId) external view returns (uint256[] memory) {
        return articleReviews[_articleId];
    }
    
    /**
     * @dev Get reviews by a reviewer
     * @param _reviewer Address of the reviewer
     * @return Array of review IDs
     */
    function getReviewerReviews(address _reviewer) external view returns (uint256[] memory) {
        return reviewerReviews[_reviewer];
    }
    
    /**
     * @dev Get citations for an article
     * @param _articleId ID of the article
     * @return Array of Citation structs
     */
    function getArticleCitations(uint256 _articleId) external view returns (Citation[] memory) {
        return articleCitations[_articleId];
    }
}
