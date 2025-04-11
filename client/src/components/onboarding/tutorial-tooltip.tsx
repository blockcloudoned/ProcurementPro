import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTutorial, TutorialStep } from './tutorial-context';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Trophy,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialTooltipProps {
  step: TutorialStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
  progress,
}) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [targetDimensions, setTargetDimensions] = useState({ width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const [hasAnimatedPoints, setHasAnimatedPoints] = useState(false);
  const [pointsCounter, setPointsCounter] = useState(0);

  // Calculate position of tooltip based on target element and requested position
  useEffect(() => {
    const calculatePosition = () => {
      const targetElement = document.querySelector(step.target);
      
      if (!targetElement || !tooltipRef.current) {
        // If target not found, center in viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 300;
        const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
        
        setPosition({
          left: (viewportWidth - tooltipWidth) / 2,
          top: (viewportHeight - tooltipHeight) / 2
        });
        return;
      }
      
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      setTargetDimensions({
        width: targetRect.width,
        height: targetRect.height
      });
      
      let left = 0;
      let top = 0;
      
      const SPACING = 20; // pixels of space between target and tooltip
      
      // Position based on specified direction
      switch (step.position) {
        case 'top':
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          top = targetRect.top - tooltipRect.height - SPACING;
          break;
        case 'right':
          left = targetRect.right + SPACING;
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
        case 'bottom':
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          top = targetRect.bottom + SPACING;
          break;
        case 'left':
          left = targetRect.left - tooltipRect.width - SPACING;
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
      }
      
      // Ensure tooltip stays within viewport bounds
      left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
      top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));
      
      setPosition({ left, top });
    };
    
    // Calculate initial position
    calculatePosition();
    
    // Recalculate on resize
    window.addEventListener('resize', calculatePosition);
    
    // Navigate to specified route if needed
    if (step.route && !window.location.pathname.includes(step.route)) {
      navigate(step.route);
    }
    
    // Animate points counter
    if (!hasAnimatedPoints && step.points > 0) {
      setHasAnimatedPoints(true);
      let counter = 0;
      const interval = setInterval(() => {
        counter += 1;
        setPointsCounter(counter);
        if (counter >= step.points) {
          clearInterval(interval);
        }
      }, 50);
    }
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [step, hasAnimatedPoints, navigate]);

  // Handle highlighting of target element
  useEffect(() => {
    if (step.target === 'body') return;
    
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;
    
    // Add highlight styles
    targetElement.classList.add('tutorial-target');
    
    // Remove highlight on cleanup
    return () => {
      targetElement.classList.remove('tutorial-target');
    };
  }, [step.target]);

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-50 w-80 rounded-lg bg-white shadow-xl border border-primary-100 transition-all duration-300 ease-in-out"
      style={{ 
        left: position.left, 
        top: position.top,
        opacity: 1,
        transform: 'scale(1)'
      }}
    >
      {/* Progress bar */}
      <div className="bg-primary-50 rounded-t-lg p-2">
        <Progress value={progress} className="h-1.5" />
      </div>
      
      {/* Points indicator */}
      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold w-12 h-12 rounded-full flex items-center justify-center animate-bounce">
        <div className="flex flex-col items-center justify-center">
          <Star className="h-3 w-3" />
          <span>+{pointsCounter}</span>
        </div>
      </div>
      
      {/* Close button */}
      <button 
        onClick={onSkip}
        className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600"
        aria-label="Close tutorial"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary-900 mb-2">{step.title}</h3>
        <p className="text-sm text-neutral-600 mb-4">{step.description}</p>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={isFirst}
            className={cn(isFirst && 'opacity-0')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          <Button size="sm" onClick={onNext}>
            {isLast ? (
              <>
                <Trophy className="h-4 w-4 mr-1" /> Finish
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Pointer/arrow based on position */}
      <div 
        className={cn(
          "absolute w-3 h-3 bg-white transform rotate-45 border-primary-100",
          step.position === 'top' && 'bottom-0 left-1/2 -mb-1.5 border-b border-r translate-x-[-50%]',
          step.position === 'right' && 'left-0 top-1/2 -ml-1.5 border-l border-t translate-y-[-50%]',
          step.position === 'bottom' && 'top-0 left-1/2 -mt-1.5 border-t border-l translate-x-[-50%]',
          step.position === 'left' && 'right-0 top-1/2 -mr-1.5 border-r border-b translate-y-[-50%]'
        )}
      />
    </div>
  );
};

// Main tutorial component that shows the current step
export const TutorialManager: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    completedSteps, 
    startTutorial, 
    completeStep, 
    endTutorial, 
    dismissTutorial,
    progress 
  } = useTutorial();
  
  if (!isActive || !currentStep) return null;
  
  const tutorialSteps = currentStep ? [currentStep] : [];
  const currentIndex = tutorialSteps.findIndex(step => step.id === currentStep?.id);
  
  const handleNext = () => {
    if (currentStep) {
      completeStep(currentStep.id);
    }
  };
  
  const handlePrev = () => {
    // In this implementation, we don't support going back
    // You could implement this by keeping track of step history
  };
  
  const handleSkip = () => {
    dismissTutorial();
  };
  
  return (
    <>
      {tutorialSteps.map((step, index) => (
        <TutorialTooltip
          key={step.id}
          step={step}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          isFirst={index === 0}
          isLast={index === tutorialSteps.length - 1}
          progress={progress}
        />
      ))}
      
      {/* Overlay for the whole screen when tutorial is active */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 pointer-events-none"
        style={{ 
          opacity: isActive ? 0.3 : 0,
          transition: 'opacity 300ms ease-in-out'
        }}
      />
      
      {/* Global styles for target highlighting */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tutorial-target {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
          transition: all 0.3s ease-in-out;
          animation: tutorial-pulse 2s infinite;
        }
        
        @keyframes tutorial-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}} />
    </>
  );
};