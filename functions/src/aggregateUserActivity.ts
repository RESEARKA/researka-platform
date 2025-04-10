import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { USER_ACTIVITIES_COLLECTION } from '../../utils/activityTracker';

// Define types for our aggregation data
interface ActivityAggregation {
  [key: string]: {
    count: number;
    users: Set<string>;
  }
}

interface ActivityMetric {
  type: string;
  count: number;
  uniqueUsers: number;
}

/**
 * Scheduled function that runs daily to aggregate user activity data
 * and clean up old raw activity records
 */
export const aggregateUserActivity = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Use transaction for atomicity
    return db.runTransaction(async (transaction) => {
      try {
        // Query activities from previous day
        const activitiesSnapshot = await db
          .collection(USER_ACTIVITIES_COLLECTION)
          .where('timestamp', '>=', yesterday)
          .get();
        
        if (activitiesSnapshot.empty) {
          console.log('No activities to aggregate for yesterday');
          return null;
        }
        
        // Aggregate by activity type
        const aggregates: ActivityAggregation = {};
        
        activitiesSnapshot.forEach(doc => {
          const data = doc.data();
          const key = data.activityType;
          
          if (!aggregates[key]) {
            aggregates[key] = {
              count: 0,
              users: new Set<string>()
            };
          }
          
          aggregates[key].count++;
          if (data.userId) {
            aggregates[key].users.add(data.userId);
          }
        });
        
        // Prepare metrics
        const metrics: ActivityMetric[] = Object.entries(aggregates).map(([type, data]) => ({
          type,
          count: data.count,
          uniqueUsers: data.users.size
        }));
        
        // Get all unique users
        const allUsers = new Set<string>();
        activitiesSnapshot.docs.forEach(doc => {
          const userId = doc.data().userId;
          if (userId) {
            allUsers.add(userId);
          }
        });
        
        // Store aggregated data
        const aggregateRef = db.collection('activityAggregates').doc(yesterday.toISOString().split('T')[0]);
        transaction.set(aggregateRef, {
          date: yesterday,
          metrics,
          totalActivities: activitiesSnapshot.size,
          totalUniqueUsers: allUsers.size,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Aggregated ${activitiesSnapshot.size} activities into daily summary`);
        
        // Clean up old raw data (older than 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const oldActivitiesSnapshot = await db
          .collection(USER_ACTIVITIES_COLLECTION)
          .where('timestamp', '<=', thirtyDaysAgo)
          .limit(500) // Process in batches to avoid timeouts
          .get();
        
        if (!oldActivitiesSnapshot.empty) {
          console.log(`Deleting ${oldActivitiesSnapshot.size} old activity records`);
          
          oldActivitiesSnapshot.forEach(doc => {
            transaction.delete(doc.ref);
          });
        }
        
        return null;
      } catch (error) {
        console.error('Error in activity aggregation:', error);
        throw error;
      }
    });
  });
