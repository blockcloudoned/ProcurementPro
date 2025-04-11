import React from 'react';
import { useTutorial } from '@/components/onboarding/tutorial-context';
import { AchievementBadgesGrid } from '@/components/achievement-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Sparkles, Trophy, Ribbon, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Achievements: React.FC = () => {
  const { badges, points, progress, completedSteps, startTutorial } = useTutorial();
  
  // Filter badges by category (just a visual grouping for this page)
  const achievementBadges = badges.filter(badge => badge.id !== 'onboarding-complete');
  const onboardingBadges = badges.filter(badge => badge.id === 'onboarding-complete');
  
  // Calculate statistics
  const totalBadges = badges.length;
  const unlockedBadges = badges.filter(badge => badge.unlocked).length;
  const nextBadge = badges.find(badge => !badge.unlocked);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9 sm:truncate">
              Achievements & Rewards
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Track your progress and earn badges as you use the platform
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button variant="outline" onClick={startTutorial}>
              <Target className="h-4 w-4 mr-2" />
              Start Tutorial
            </Button>
          </div>
        </div>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                {points}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary-500" />
                {unlockedBadges} / {totalBadges}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Tutorial Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Progress value={progress} className="h-2" />
              </div>
              <div className="text-sm text-neutral-600">{completedSteps.length} steps completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Next Badge</CardTitle>
            </CardHeader>
            <CardContent>
              {nextBadge ? (
                <div className="flex items-center">
                  <div className="text-lg font-medium">{nextBadge.name}</div>
                  <div className="ml-auto text-sm text-neutral-500">{nextBadge.progress}%</div>
                </div>
              ) : (
                <div className="text-lg font-medium">All badges unlocked!</div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Badges */}
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-neutral-900 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Available Badges
            </h3>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="locked">Locked</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Badges</CardTitle>
                <CardDescription>
                  Your progress towards earning all available achievement badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AchievementBadgesGrid badges={badges} size="lg" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unlocked">
            <Card>
              <CardHeader>
                <CardTitle>Unlocked Badges</CardTitle>
                <CardDescription>
                  Badges you have already earned through your activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badges.filter(b => b.unlocked).length > 0 ? (
                  <AchievementBadgesGrid 
                    badges={badges.filter(b => b.unlocked)} 
                    size="lg" 
                  />
                ) : (
                  <div className="text-center py-12">
                    <Ribbon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-700 mb-1">No badges unlocked yet</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      Continue using the platform and completing activities to earn achievement badges.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={startTutorial}>
                      Start the tutorial to earn your first badge
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locked">
            <Card>
              <CardHeader>
                <CardTitle>Locked Badges</CardTitle>
                <CardDescription>
                  Badges you're still working towards unlocking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badges.filter(b => !b.unlocked).length > 0 ? (
                  <AchievementBadgesGrid 
                    badges={badges.filter(b => !b.unlocked)} 
                    size="lg" 
                  />
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 mx-auto text-primary-300 mb-4" />
                    <h3 className="text-lg font-medium text-primary-700 mb-1">Congratulations!</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      You've unlocked all available achievement badges. Check back later for more challenges.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* How to Earn Points */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            How to Earn Points
          </h3>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-neutral-900">Complete the Tutorial</h4>
                    <p className="text-sm text-neutral-500">Follow the interactive tutorial to learn about the platform features (50 points)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-neutral-900">Create Proposals</h4>
                    <p className="text-sm text-neutral-500">Create new business proposals using our templates (25 points each)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-neutral-900">Use Different Templates</h4>
                    <p className="text-sm text-neutral-500">Explore and use all available proposal templates (15 points each)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-neutral-900">Connect CRM Systems</h4>
                    <p className="text-sm text-neutral-500">Integrate with external CRM platforms like HubSpot or Salesforce (50 points)</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                    <span className="text-primary-700 font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-neutral-900">Export Proposals</h4>
                    <p className="text-sm text-neutral-500">Export proposals to different formats (10 points each)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Achievements;