import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// Interfaces for achievement-related data
export interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  requiredCount: number;
  createdAt: Date | null;
}

export interface UserAchievement {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: Date | null;
  progress: number;
  count: number;
  badge?: Badge;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  data: any;
  entityId: number | null;
  entityType: string | null;
  createdAt: Date | null;
}

// Hook to get user achievements with badges
export function useUserAchievements(userId: number) {
  return useQuery({
    queryKey: [`/api/users/${userId}/achievements`],
  });
}

// Hook to get user activities
export function useUserActivities(userId: number) {
  return useQuery({
    queryKey: [`/api/users/${userId}/activities`],
  });
}

// Hook to get all available badges
export function useBadges(category?: string) {
  const queryKey = category 
    ? [`/api/badges?category=${category}`]
    : ['/api/badges'];
    
  return useQuery({
    queryKey,
  });
}

// Function to track user activity
export async function trackUserActivity(
  userId: number, 
  activityType: string, 
  entityId?: number,
  entityType?: string,
  data?: any
): Promise<UserActivity> {
  const activity = {
    userId,
    activityType,
    entityId: entityId || null,
    entityType: entityType || null,
    data: data || {}
  };
  
  // Make the API request to record the activity
  const result = await apiRequest<UserActivity>(
    'POST', 
    '/api/users/activities', 
    activity
  );
  
  // Invalidate relevant queries to ensure data is fresh
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
  queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/achievements`] });
  
  return result;
}

// Calculate progress percentage for a badge
export function calculateBadgeProgress(
  achievement: UserAchievement, 
  badge?: Badge
): number {
  if (!badge) {
    badge = achievement.badge;
  }
  
  if (!badge || !badge.requiredCount) {
    return 0;
  }
  
  const progress = achievement.count / badge.requiredCount;
  return Math.min(Math.round(progress * 100), 100);
}