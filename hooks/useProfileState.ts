import { useReducer, useCallback, useRef, useEffect } from 'react';
import { UserProfile } from './useProfileData';
import { isClientSide, getConsistentInitialState } from '../utils/hydrationHelpers';

// Define action types for the reducer
export enum ProfileActionType {
  SET_ACTIVE_TAB = 'SET_ACTIVE_TAB',
  SET_CURRENT_PAGE = 'SET_CURRENT_PAGE',
  TOGGLE_EDIT_MODE = 'TOGGLE_EDIT_MODE',
  SET_EDIT_MODE = 'SET_EDIT_MODE',
  SET_LOCAL_LOADING = 'SET_LOCAL_LOADING',
  RESET_STATE = 'RESET_STATE',
  BATCH_UPDATE = 'BATCH_UPDATE'
}

// Define the state interface
export interface ProfileState {
  activeTab: number;
  currentPage: number;
  isEditMode: boolean;
  localLoading: boolean;
}

// Define the action interface
interface ProfileAction {
  type: ProfileActionType;
  payload?: any;
}

// Define the initial state
const initialState: ProfileState = {
  activeTab: getConsistentInitialState(0, 0),
  currentPage: getConsistentInitialState(1, 1),
  isEditMode: getConsistentInitialState(false, false),
  localLoading: getConsistentInitialState(false, false)
};

// Create the reducer function
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case ProfileActionType.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    case ProfileActionType.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case ProfileActionType.TOGGLE_EDIT_MODE:
      return { ...state, isEditMode: !state.isEditMode };
    case ProfileActionType.SET_EDIT_MODE:
      return { ...state, isEditMode: action.payload };
    case ProfileActionType.SET_LOCAL_LOADING:
      return { ...state, localLoading: action.payload };
    case ProfileActionType.RESET_STATE:
      return initialState;
    case ProfileActionType.BATCH_UPDATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

/**
 * Custom hook for managing profile UI state
 * Separates UI state management from business logic
 */
export function useProfileState() {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  
  // Refs to prevent duplicate operations
  const isUpdatingProfile = useRef(false);
  const profileUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(isClientSide());
  const lastUpdateTime = useRef<number>(0);
  const operationStartTimeRef = useRef<number>(0);
  
  // Action creators
  const setActiveTab = useCallback((tab: number) => {
    dispatch({ type: ProfileActionType.SET_ACTIVE_TAB, payload: tab });
  }, []);
  
  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: ProfileActionType.SET_CURRENT_PAGE, payload: page });
  }, []);
  
  const toggleEditMode = useCallback(() => {
    // Prevent rapid toggling of edit mode
    const now = Date.now();
    if (now - lastUpdateTime.current < 1000) {
      console.log('[ProfileState] Edit request ignored - too soon after last action');
      return;
    }
    
    lastUpdateTime.current = now;
    dispatch({ type: ProfileActionType.TOGGLE_EDIT_MODE });
  }, []);
  
  const setEditMode = useCallback((isEdit: boolean) => {
    dispatch({ type: ProfileActionType.SET_EDIT_MODE, payload: isEdit });
  }, []);
  
  const setLocalLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: ProfileActionType.SET_LOCAL_LOADING, payload: isLoading });
  }, []);
  
  const batchUpdate = useCallback((updates: Partial<ProfileState>) => {
    if (isMounted.current) {
      dispatch({ type: ProfileActionType.BATCH_UPDATE, payload: updates });
    } else {
      console.log('[ProfileState] Skipping state update on unmounted component');
    }
  }, []);
  
  // Set up component mount/unmount tracking
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      
      // Clean up any timeouts on unmount
      if (profileUpdateTimeout.current) {
        clearTimeout(profileUpdateTimeout.current);
        profileUpdateTimeout.current = null;
      }
    };
  }, []);
  
  return {
    // State
    ...state,
    
    // Action creators
    setActiveTab,
    setCurrentPage,
    toggleEditMode,
    setEditMode,
    setLocalLoading,
    batchUpdate,
    
    // Refs
    isUpdatingProfile,
    profileUpdateTimeout,
    lastUpdateTime,
    operationStartTimeRef
  };
}
