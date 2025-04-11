import { apiRequest, queryClient } from "./queryClient";

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requiredCount: number;
  createdAt: string | null;
}

export interface UserAchievement {
  id: number;
  userId: number;
  badgeId: number;
  earnedAt: string | null;
  count: number;
  progress: number;
  badge?: Badge;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  entityId: number | null;
  entityType: string | null;
  data: any;
  createdAt: string | null;
}

export interface AchievementNotification {
  badges: Badge[];
  message: string;
}

export const getAchievements = async (userId: number): Promise<UserAchievement[]> => {
  return apiRequest<UserAchievement[]>(`/api/users/${userId}/achievements`);
};

export const getBadges = async (category?: string): Promise<Badge[]> => {
  const url = category ? `/api/badges?category=${category}` : '/api/badges';
  return apiRequest<Badge[]>(url);
};

export const getBadge = async (id: number): Promise<Badge> => {
  return apiRequest<Badge>(`/api/badges/${id}`);
};

export const getUserActivities = async (userId: number): Promise<UserActivity[]> => {
  return apiRequest<UserActivity[]>(`/api/users/${userId}/activities`);
};

export const invalidateAchievementQueries = () => {
  queryClient.invalidateQueries({ queryKey: ['/api/users'] });
  queryClient.invalidateQueries({ queryKey: ['/api/badges'] });
};