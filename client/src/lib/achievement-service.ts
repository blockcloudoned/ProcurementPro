import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/onboarding/tutorial-context';

export interface UserAchievement {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string;
  progress: number;
  badge?: Badge;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  entityId: number;
  entityType: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * Track user activity to potentially earn achievements
 */
export const trackActivity = async (
  activityType: 'tutorial_progress' | 'proposal_creation' | 'document_export' | 'client_management' | 'template_usage' | 'crm_integration',
  entityId: number,
  entityType: string,
  data: Record<string, any>
): Promise<{ badges: Badge[] }> => {
  try {
    // Default user ID (in a real app this would be the currently logged in user)
    const userId = 1;
    
    const activity = {
      userId,
      activityType,
      entityId,
      entityType,
      data
    };
    
    // Send the activity to the server
    const result = await apiRequest<{ badges: Badge[] }>('/api/activities', {
      method: 'POST',
      data: activity
    });
    
    return result;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return { badges: [] };
  }
};

/**
 * Get all achievements for the current user
 */
export const getUserAchievements = async (userId = 1): Promise<UserAchievement[]> => {
  try {
    const achievements = await apiRequest<UserAchievement[]>(`/api/users/${userId}/achievements`);
    return achievements;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
};

/**
 * Get all user activities
 */
export const getUserActivities = async (userId = 1): Promise<UserActivity[]> => {
  try {
    const activities = await apiRequest<UserActivity[]>(`/api/users/${userId}/activities`);
    return activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};

/**
 * Track tutorial progress
 */
export const trackTutorialProgress = async (
  stepId: string,
  stepTitle: string,
  completedSteps: string[],
  points: number
) => {
  return trackActivity(
    'tutorial_progress',
    0, // No specific entity ID for tutorial steps
    'tutorial_step',
    {
      stepId,
      stepTitle,
      completedSteps,
      points
    }
  );
};

/**
 * Get all available badges
 */
export const getAllBadges = async (): Promise<Badge[]> => {
  try {
    const badges = await apiRequest<Badge[]>('/api/badges');
    return badges;
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};