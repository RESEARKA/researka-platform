import { getFirebaseFirestore } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { isEmail } from 'validator';

// Constants
export const ADMIN_LOGS_COLLECTION = 'adminActivityLogs';

export enum AdminActionType {
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  ARTICLE_APPROVE = 'article_approve',
  ARTICLE_REJECT = 'article_reject',
  ARTICLE_DELETE = 'article_delete',
  ROLE_CHANGE = 'role_change',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SETTING_CHANGE = 'setting_change'
}

export type AdminRole = 'Admin' | 'JuniorAdmin';
export type TargetType = 'user' | 'article' | 'flag' | 'setting';

// Sanitize details to prevent injection
function sanitizeDetails(details: Record<string, any>): Record<string, any> {
  // Basic sanitization - remove potential script tags and limit depth
  const sanitized: Record<string, any> = {};
  
  Object.keys(details).forEach(key => {
    // Skip functions or complex objects
    if (typeof details[key] === 'function') return;
    
    // Handle nested objects (limit depth)
    if (typeof details[key] === 'object' && details[key] !== null) {
      sanitized[key] = JSON.stringify(details[key]);
      return;
    }
    
    // Convert to string and sanitize
    const value = String(details[key]);
    sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  });
  
  return sanitized;
}

/**
 * Logs an administrative action to Firestore
 * 
 * @param adminId - The ID of the admin performing the action
 * @param adminEmail - The email of the admin performing the action
 * @param adminRole - The role of the admin (Admin or JuniorAdmin)
 * @param actionType - The type of action being performed
 * @param targetType - The type of resource being acted upon
 * @param targetId - Optional ID of the target resource
 * @param details - Optional additional details about the action
 * @returns Object indicating success or failure with error message
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  adminRole: AdminRole,
  actionType: AdminActionType,
  targetType: TargetType,
  targetId?: string,
  details?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate inputs
    if (!adminId?.trim()) {
      return { success: false, error: 'Invalid admin ID' };
    }
    
    if (!adminEmail?.trim() || !isEmail(adminEmail)) {
      return { success: false, error: 'Invalid admin email format' };
    }
    
    const db = getFirebaseFirestore();
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }
    
    await addDoc(collection(db, ADMIN_LOGS_COLLECTION), {
      adminId,
      adminEmail,
      adminRole,
      actionType,
      targetType,
      targetId: targetId || null,
      details: sanitizeDetails(details || {}),
      timestamp: serverTimestamp(), // Use server timestamp for consistency
      ipAddress: null // Could be captured server-side
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to log admin action:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error logging admin action'
    };
  }
}
