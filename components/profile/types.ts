import { UserProfile } from '../../hooks/useProfileData';

/**
 * Enum for profile loading states
 * Used for more granular loading state management
 */
export enum ProfileLoadingState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING_PROFILE = 'loading_profile',
  LOADING_ARTICLES = 'loading_articles',
  LOADING_REVIEWS = 'loading_reviews',
  UPDATING_PROFILE = 'updating_profile',
  ERROR = 'error'
}

/**
 * Props for the ProfileHeader component
 */
export interface ProfileHeaderProps {
  profile: UserProfile | null;
  isEditMode: boolean;
  isLoading: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

/**
 * Props for the ProfileStats component
 */
export interface ProfileStatsProps {
  articlesCount: number;
  reviewsCount: number;
  reputation: number;
  isLoading?: boolean;
}

/**
 * Props for the ProfileContent component
 */
export interface ProfileContentProps {
  profile: UserProfile | null;
  activeTab: number;
  isEditMode: boolean;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  isInLoadingState: (state: ProfileLoadingState) => boolean;
  onTabChange: (index: number) => void;
  onPageChange: (page: number) => void;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => Promise<boolean>;
  onRetryLoading: () => void;
}

/**
 * Props for the ArticlesPanel component
 */
export interface ArticlesPanelProps {
  articles: any[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Props for the ReviewsPanel component
 */
export interface ReviewsPanelProps {
  reviews: any[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Props for the SavedItemsPanel component
 */
export interface SavedItemsPanelProps {
  savedItems: any[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Props for the ProfileManager component
 */
export interface ProfileManagerProps {
  profile: UserProfile | null;
  isLoading: boolean;
  isInLoadingState: (state: ProfileLoadingState) => boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  handleError: (error: any, message: string) => void;
  logOperation: (message: string, data?: any) => void;
}
