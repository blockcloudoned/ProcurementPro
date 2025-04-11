import React from 'react';
import { 
  Award, 
  Star, 
  Zap, 
  Target, 
  CheckCircle2, 
  Trophy, 
  Medal,
  Clock,
  LucideIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge as BadgeType } from '@/lib/achievement-service';

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  award: Award,
  star: Star,
  zap: Zap,
  target: Target,
  check: CheckCircle2,
  trophy: Trophy,
  medal: Medal,
  clock: Clock
};

interface AchievementBadgeProps {
  badge: BadgeType;
  earned?: boolean;
  progress?: number;
}

export function AchievementBadge({ badge, earned = false, progress = 0 }: AchievementBadgeProps) {
  // Default icon fallback
  const IconComponent = iconMap[badge.icon.toLowerCase()] || Trophy;
  
  // Function to determine badge styles based on category
  const getBadgeStyles = (category: string, earned: boolean) => {
    const baseClasses = "flex flex-col items-center justify-center rounded-full p-3";
    
    if (!earned) {
      return `${baseClasses} bg-gray-100 text-gray-400 opacity-60`;
    }
    
    switch (category.toLowerCase()) {
      case 'proposals':
        return `${baseClasses} bg-blue-100 text-blue-600`;
      case 'clients':
        return `${baseClasses} bg-green-100 text-green-600`;
      case 'exports':
        return `${baseClasses} bg-purple-100 text-purple-600`;
      case 'achievement':
        return `${baseClasses} bg-yellow-100 text-yellow-600`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-600`;
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center m-2 relative">
            <div className={getBadgeStyles(badge.category, earned)}>
              <IconComponent className="h-8 w-8" />
            </div>
            <div className="mt-2 text-sm font-medium text-center">
              {badge.name}
            </div>
            {!earned && progress > 0 && progress < 100 && (
              <div className="w-full mt-1">
                <Progress value={progress} className="h-1" />
                <div className="text-xs text-gray-500 text-center mt-1">
                  {progress}%
                </div>
              </div>
            )}
            {earned && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-1">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm">{badge.description}</p>
            {!earned && badge.requiredCount > 0 && (
              <p className="text-xs mt-1 text-gray-500">
                Progress: {progress}% (Need {badge.requiredCount} to earn)
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}