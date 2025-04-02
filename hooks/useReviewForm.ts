import { useState, useCallback } from 'react';
import { Review, ReviewSuggestion } from '../types/review'; // Correct import path
import { generateAIRatings, determineAIDecision } from '../utils/reviewUtils';

// Define the structure for validation errors
interface ReviewFormErrors {
  ratings?: string;
  decision?: string;
  comments?: string;
}

// Define the return type of the hook
export interface UseReviewFormReturn {
  review: Partial<Review>;
  setReview: React.Dispatch<React.SetStateAction<Partial<Review>>>;
  suggestions: ReviewSuggestion[];
  aiRatings: Review['ratings'] | null;
  isAIAnalyzing: boolean;
  setIsAIAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  isAIAnalysisComplete: boolean;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  errors: ReviewFormErrors;
  isEditing: boolean;
  handleChange: (field: keyof Review | 'ratings', value: any) => void; // Adjust field type
  handleSuggestionsGenerated: (newSuggestions: ReviewSuggestion[]) => void;
  handleAnalyzeRequest: () => void;
  handleAnalysisStateChange: (analyzing: boolean) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

// Default initial ratings structure matching Review['ratings']
const defaultRatings: Review['ratings'] = {
  originality: 3,
  methodology: 3,
  clarity: 3,
  significance: 3,
  references: 3,
};

// Custom Hook Implementation
export function useReviewForm(initialReview?: Partial<Review>): UseReviewFormReturn {
  // Determine if we are editing an existing review
  const isEditing = !!initialReview?.id;

  // State for the review form data
  const [review, setReview] = useState<Partial<Review>>(() => {
    const defaults: Partial<Review> = {
      ratings: { ...defaultRatings }, // Ensure ratings structure exists
      decision: 'minor_revision', // Default decision
      comments: '',
      privateComments: '',
    };
    
    // If editing, merge initial review with defaults
    return initialReview ? { ...defaults, ...initialReview } : defaults;
  });

  // State for AI suggestions and analysis
  const [suggestions, setSuggestions] = useState<ReviewSuggestion[]>([]);
  const [aiRatings, setAiRatings] = useState<Review['ratings'] | null>(null);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState<boolean>(false);
  const [isAIAnalysisComplete, setIsAIAnalysisComplete] = useState<boolean>(false);
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State for validation errors
  const [errors, setErrors] = useState<ReviewFormErrors>({});

  // Function to handle AI analysis state changes
  const handleAnalysisStateChange = useCallback((analyzing: boolean) => {
    setIsAIAnalyzing(analyzing);
  }, []);

  // Function to handle AI suggestions being generated
  const handleSuggestionsGenerated = useCallback((newSuggestions: ReviewSuggestion[]) => {
    try {
      setSuggestions(newSuggestions);
      setIsAIAnalysisComplete(true);
      
      // Only process ratings for new reviews, not when editing
      if (!isEditing) {
        const generatedRatings = generateAIRatings(newSuggestions);
        setAiRatings(generatedRatings);

        // Pre-fill review fields only if NOT editing
        const suggestedDecision = determineAIDecision(generatedRatings);
        setReview(prev => ({
          ...prev,
          ratings: generatedRatings,
          decision: suggestedDecision,
        }));
      }
    } catch (error) {
       console.error("Error processing AI suggestions:", error);
    }
  }, [isEditing]);

  // Function to handle manual AI analysis request
  const handleAnalyzeRequest = useCallback(() => {
    setIsAIAnalyzing(true);
  }, []);

  // Function to handle field changes in the form
  const handleChange = useCallback((field: keyof Review | 'ratings', value: any) => {
    // Clear any errors for the field being changed
    if (errors[field as keyof ReviewFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ReviewFormErrors];
        return newErrors;
      });
    }
    
    // Update the review state with the new value
    setReview(prev => {
      if (field === 'ratings' && prev.ratings) {
        // For ratings, we need to merge with existing ratings
        return {
          ...prev,
          ratings: {
            ...prev.ratings,
            ...value // Merge in new rating values
          }
        };
      } else {
        // For other fields, simply update the value
        return {
          ...prev,
          [field]: value
        };
      }
    });
  }, [errors]);

  // Validate the form before submission
  const validateForm = useCallback(() => {
    const newErrors: ReviewFormErrors = {};
    let isValid = true;
    
    // Validate ratings
    const ratings = review.ratings || defaultRatings;
    const requiredRatingKeys: (keyof Review['ratings'])[] = [
      'originality', 'methodology', 'clarity', 'significance', 'references'
    ];
    
    // Check if all required ratings exist and are valid
    const missingRatings = requiredRatingKeys.some(key => 
      typeof ratings[key] !== 'number' || ratings[key] < 1 || ratings[key] > 5
    );
    
    if (missingRatings) {
      newErrors.ratings = 'All rating criteria must be scored (1-5)';
      isValid = false;
    }
    
    // Validate decision
    if (!review.decision) {
      newErrors.decision = 'Please select a decision';
      isValid = false;
    } else if (!['accept', 'minor_revision', 'major_revision', 'reject'].includes(review.decision)) {
      newErrors.decision = 'Invalid decision value';
      isValid = false;
    }
    
    // Validate comments
    if (!review.comments || review.comments.trim() === '') {
      newErrors.comments = 'Please provide review comments';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  }, [review]);

  // Reset the form to initial state
  const resetForm = useCallback(() => {
    setReview({
      ratings: { ...defaultRatings },
      decision: 'minor_revision',
      comments: '',
      privateComments: '',
    });
    setSuggestions([]);
    setAiRatings(null);
    setIsAIAnalysisComplete(false);
    setIsAIAnalyzing(false);
    setErrors({});
  }, []);

  // Return the hook API
  return {
    review,
    setReview,
    suggestions,
    aiRatings,
    isAIAnalyzing,
    setIsAIAnalyzing,
    isAIAnalysisComplete,
    isSubmitting,
    setIsSubmitting,
    errors,
    isEditing,
    handleChange,
    handleSuggestionsGenerated,
    handleAnalyzeRequest,
    handleAnalysisStateChange,
    validateForm,
    resetForm,
  };
}
