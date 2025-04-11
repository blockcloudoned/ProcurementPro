import React, { createContext, useState, useContext, useEffect } from 'react';

// Define tutorial steps
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  position: 'top' | 'right' | 'bottom' | 'left';
  order: number;
  points: number; // Points awarded for completing this step
  route?: string; // Optional route to navigate to for this step
  actionRequired?: boolean; // Whether user needs to perform an action to proceed
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0-100
  requiredPoints: number;
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: TutorialStep | null;
  completedSteps: string[];
  points: number;
  badges: Badge[];
  startTutorial: () => void;
  endTutorial: () => void;
  goToStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  dismissTutorial: () => void;
  progress: number; // 0-100
}

// Create tutorial context with default values
const TutorialContext = createContext<TutorialContextType>({
  isActive: false,
  currentStep: null,
  completedSteps: [],
  points: 0,
  badges: [],
  startTutorial: () => {},
  endTutorial: () => {},
  goToStep: () => {},
  completeStep: () => {},
  dismissTutorial: () => {},
  progress: 0,
});

// Tutorial steps data
export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ProposalPro',
    description: 'Let\'s take a quick tour to help you get started with creating professional proposals.',
    target: 'body',
    position: 'bottom',
    order: 1,
    points: 5,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'This is your dashboard where you can see all your proposals and analytics.',
    target: 'h2',
    position: 'bottom',
    order: 2,
    points: 5,
  },
  {
    id: 'create-proposal',
    title: 'Create Your First Proposal',
    description: 'Click here to start creating a new proposal.',
    target: 'a[href="/create-proposal"]',
    position: 'bottom',
    order: 3,
    points: 10,
    actionRequired: true,
  },
  {
    id: 'templates',
    title: 'Choose a Template',
    description: 'Select from our range of professional templates.',
    target: 'a[href="/templates"]',
    position: 'right',
    order: 4,
    points: 10,
    route: '/templates',
  },
  {
    id: 'crm-integration',
    title: 'Connect Your CRM',
    description: 'Import client data from your CRM systems to streamline your workflow.',
    target: 'a[href="/crm-integration"]',
    position: 'left',
    order: 5,
    points: 15,
    route: '/crm-integration',
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'Monitor proposal performance with built-in analytics.',
    target: '.h3:contains("Analytics")',
    position: 'top',
    order: 6,
    points: 5,
  },
  {
    id: 'completed',
    title: 'Tour Completed!',
    description: 'You\'ve completed the tour and earned your first achievement badge!',
    target: 'body',
    position: 'bottom',
    order: 7,
    points: 20,
  },
];

// Available badges
const initialBadges: Badge[] = [
  {
    id: 'onboarding-complete',
    name: 'Onboarding Champion',
    description: 'Completed the interactive tutorial and learned the basics',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    requiredPoints: 50,
  },
  {
    id: 'proposal-creator',
    name: 'Proposal Creator',
    description: 'Created your first proposal',
    icon: '📝',
    unlocked: false,
    progress: 0,
    requiredPoints: 25,
  },
  {
    id: 'template-master',
    name: 'Template Master',
    description: 'Used all available templates',
    icon: '🎭',
    unlocked: false,
    progress: 0,
    requiredPoints: 75,
  },
];

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [progress, setProgress] = useState(0);

  // Initialize tutorial from localStorage if available
  useEffect(() => {
    const savedTutorial = localStorage.getItem('tutorial-progress');
    if (savedTutorial) {
      const { completedSteps, points, badgeData } = JSON.parse(savedTutorial);
      setCompletedSteps(completedSteps || []);
      setPoints(points || 0);
      
      if (badgeData) {
        const updatedBadges = initialBadges.map(badge => {
          const savedBadge = badgeData.find((b: Badge) => b.id === badge.id);
          return savedBadge ? { ...badge, ...savedBadge } : badge;
        });
        setBadges(updatedBadges);
      }
    }
    
    // Show tutorial automatically for new users
    const hasSeenTutorial = localStorage.getItem('has-seen-tutorial') === 'true';
    if (!hasSeenTutorial) {
      // Delay to ensure the DOM is ready
      setTimeout(() => {
        startTutorial();
      }, 1000);
    }
  }, []);

  // Calculate progress whenever completed steps change
  useEffect(() => {
    const totalSteps = tutorialSteps.length;
    const completedCount = completedSteps.length;
    setProgress(totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0);
    
    // Update badges based on points
    const updatedBadges = badges.map(badge => {
      const newProgress = Math.min(100, Math.round((points / badge.requiredPoints) * 100));
      const nowUnlocked = points >= badge.requiredPoints;
      
      // If newly unlocked, show notification
      if (nowUnlocked && !badge.unlocked) {
        showBadgeNotification(badge);
      }
      
      return {
        ...badge,
        progress: newProgress,
        unlocked: nowUnlocked,
      };
    });
    
    setBadges(updatedBadges);
    
    // Save progress to localStorage
    localStorage.setItem('tutorial-progress', JSON.stringify({
      completedSteps,
      points,
      badgeData: updatedBadges,
    }));
  }, [completedSteps, points]);

  // Function to show badge notification
  const showBadgeNotification = (badge: Badge) => {
    // This would integrate with a toast notification system
    console.log(`🎉 Badge Unlocked: ${badge.name} - ${badge.description}`);
    
    // In a real implementation, you would show a toast or modal
    // For simplicity, we're just logging to console here
  };

  // Start the tutorial
  const startTutorial = () => {
    setIsActive(true);
    if (completedSteps.length === 0) {
      setCurrentStep(tutorialSteps[0]);
    } else {
      // Find the next incomplete step
      const nextStepIndex = completedSteps.length;
      if (nextStepIndex < tutorialSteps.length) {
        setCurrentStep(tutorialSteps[nextStepIndex]);
      } else {
        setCurrentStep(null);
        setIsActive(false);
      }
    }
    
    localStorage.setItem('has-seen-tutorial', 'true');
  };

  // End the tutorial
  const endTutorial = () => {
    setIsActive(false);
    setCurrentStep(null);
  };

  // Go to a specific step
  const goToStep = (stepId: string) => {
    const step = tutorialSteps.find(s => s.id === stepId);
    if (step) {
      setCurrentStep(step);
      setIsActive(true);
    }
  };

  // Complete a step
  const completeStep = (stepId: string) => {
    // Only add points if this is a new completion
    if (!completedSteps.includes(stepId)) {
      const step = tutorialSteps.find(s => s.id === stepId);
      if (step) {
        setPoints(prevPoints => prevPoints + step.points);
        setCompletedSteps(prev => [...prev, stepId]);
      }
    }
    
    // Move to the next step
    const currentIndex = tutorialSteps.findIndex(s => s.id === stepId);
    if (currentIndex < tutorialSteps.length - 1) {
      setCurrentStep(tutorialSteps[currentIndex + 1]);
    } else {
      // If this was the last step, end the tutorial
      setIsActive(false);
      setCurrentStep(null);
    }
  };

  // Dismiss the tutorial
  const dismissTutorial = () => {
    setIsActive(false);
    localStorage.setItem('has-seen-tutorial', 'true');
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        completedSteps,
        points,
        badges,
        startTutorial,
        endTutorial,
        goToStep,
        completeStep,
        dismissTutorial,
        progress,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

// Custom hook to use the tutorial context
export const useTutorial = () => useContext(TutorialContext);