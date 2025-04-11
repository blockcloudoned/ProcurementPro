import React from 'react';
import {
  Award,
  Trophy,
  Star,
  Users,
  Network,
  CheckCircle,
  DollarSign,
  LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";

import type { Badge } from "@/lib/achievement-service";

const iconMap: Record<string, React.ElementType> = {
  'award': Award,
  'trophy': Trophy,
  'star': Star,
  'users': Users,
  'network': Network,
  'check-circle': CheckCircle,
  'dollar-sign': DollarSign,
};

interface AchievementBadgeProps {
  badge: Badge;
  earned?: boolean;
  progress?: number;
}

export function AchievementBadge({ badge, earned = false, progress = 0 }: AchievementBadgeProps) {
  const IconComponent = iconMap[badge.icon] || Award;
  const progressPercentage = Math.min(100, Math.round((progress / badge.requiredCount) * 100));
  
  return (
    <Card className={`border-2 ${earned ? 'border-primary' : 'border-muted-foreground/20'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{badge.name}</CardTitle>
          {earned && (
            <UIBadge variant="default" className="bg-primary">
              Earned
            </UIBadge>
          )}
        </div>
        <CardDescription>{badge.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className={`p-4 rounded-full ${earned ? 'bg-primary/20' : 'bg-muted'}`}>
            <IconComponent 
              className={`w-8 h-8 ${earned ? 'text-primary' : 'text-muted-foreground'}`} 
            />
          </div>
          
          {!earned && badge.requiredCount > 1 && (
            <div className="w-full mt-4">
              <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                <span>Progress: {progress} / {badge.requiredCount}</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}