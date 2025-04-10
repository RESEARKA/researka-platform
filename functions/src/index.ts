import * as admin from 'firebase-admin';
import { aggregateUserActivity } from './aggregateUserActivity';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all functions
export {
  aggregateUserActivity
};
