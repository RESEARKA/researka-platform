// Profile loading states for more granular tracking
export enum ProfileLoadingState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LOADING = 'loading',
  UPDATING = 'updating',
  ERROR = 'error',
  SUCCESS = 'success'
}

// Helper function to check if profile is in one of the specified loading states
export function isInLoadingState(states: ProfileLoadingState[], currentState?: ProfileLoadingState): boolean {
  if (!currentState) return false;
  return states.includes(currentState);
}
