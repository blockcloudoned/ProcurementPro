import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgeType } from '@/components/onboarding/tutorial-context';
import { Lock, Award, CheckCircle, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  '🏆': Award,
  '📝': CheckCircle,
  '🎭': Medal,
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  size = 'md',
  showProgress = true,
}) => {
  // Map the icon to a Lucide component or use the default
  const IconComponent = iconMap[badge.icon] || Award;
  
  // Determine size classes
  const sizeClasses = {
    sm: {
      card: 'w-20 h-24',
      icon: 'w-8 h-8',
      name: 'text-xs',
      badge: 'w-4 h-4',
    },
    md: {
      card: 'w-28 h-32',
      icon: 'w-12 h-12',
      name: 'text-sm',
      badge: 'w-5 h-5',
    },
    lg: {
      card: 'w-36 h-40',
      icon: 'w-16 h-16',
      name: 'text-base',
      badge: 'w-6 h-6',
    },
  }[size];
  
  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 group',
      sizeClasses.card,
      badge.unlocked ? 'bg-gradient-to-b from-primary-50 to-white' : 'bg-neutral-50',
      badge.unlocked ? 'border-primary-200' : 'border-neutral-200'
    )}>
      <CardContent className="p-3 flex flex-col items-center justify-center h-full">
        {/* Badge Icon */}
        <div className={cn(
          'rounded-full p-3 mb-2 flex items-center justify-center transition-all duration-300',
          badge.unlocked ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-400'
        )}>
          <IconComponent className={sizeClasses.icon} />
        </div>
        
        {/* Badge Name */}
        <h4 className={cn(
          'font-medium text-center transition-all duration-300',
          sizeClasses.name,
          badge.unlocked ? 'text-primary-900' : 'text-neutral-500'
        )}>
          {badge.name}
        </h4>
        
        {/* Status indicator */}
        {!badge.unlocked && (
          <div className="absolute top-2 right-2">
            <Lock className="w-3 h-3 text-neutral-400" />
          </div>
        )}
        
        {/* Unlocked indicator */}
        {badge.unlocked && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
          </div>
        )}
        
        {/* Progress bar */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
            <Progress value={badge.progress} className="h-1" />
          </div>
        )}
      </CardContent>
      
      {/* Tooltip on hover */}
      <div className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex flex-col justify-center items-center text-center text-xs pointer-events-none">
        <p className="font-bold mb-1">{badge.name}</p>
        <p className="text-[10px] leading-tight">{badge.description}</p>
        {!badge.unlocked && (
          <p className="mt-1 text-[10px] text-primary-300">
            {badge.progress}% complete ({badge.requiredPoints} points needed)
          </p>
        )}
      </div>
    </Card>
  );
};

interface AchievementBadgesGridProps {
  badges: BadgeType[];
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const AchievementBadgesGrid: React.FC<AchievementBadgesGridProps> = ({
  badges,
  size = 'md',
  showProgress = true,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {badges.map((badge) => (
        <AchievementBadge
          key={badge.id}
          badge={badge}
          size={size}
          showProgress={showProgress}
        />
      ))}
    </div>
  );
};

export default AchievementBadge;