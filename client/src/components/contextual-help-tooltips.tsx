import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  User, 
  MessageSquare, 
  Lightbulb, 
  AlertTriangle, 
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types of assistant characters for different help contexts
export enum HelpCharacter {
  Expert = 'expert',
  Coach = 'coach',
  Analyst = 'analyst',
  Friend = 'friend',
  Technical = 'technical',
}

// Help messages by context and character
const helpMessages: Record<string, Record<HelpCharacter, string>> = {
  'executiveSummary': {
    [HelpCharacter.Expert]: "The executive summary should concisely explain the value proposition and key benefits. Focus on what makes your proposal uniquely valuable.",
    [HelpCharacter.Coach]: "This is your chance to shine! Make a strong first impression by clearly stating what problem you're solving and why your solution is perfect.",
    [HelpCharacter.Analyst]: "Statistically, proposals with clear, benefit-focused executive summaries are 38% more likely to be approved.",
    [HelpCharacter.Friend]: "Think of this as your elevator pitch! What would make the client excited about working with you?",
    [HelpCharacter.Technical]: "Include 3-5 concise paragraphs covering the problem statement, proposed solution, benefits, timeline, and investment summary.",
  },
  'scopeOfWork': {
    [HelpCharacter.Expert]: "Define project boundaries precisely to prevent scope creep. Include what's covered and explicitly state what's excluded.",
    [HelpCharacter.Coach]: "Break down the work into clear phases or components. Make it easy for the client to understand exactly what you'll deliver.",
    [HelpCharacter.Analyst]: "Well-defined scope sections reduce change requests by up to 40% and improve project completion rates.",
    [HelpCharacter.Friend]: "This is your protection against 'could you just add this one more thing?' requests later. Be specific!",
    [HelpCharacter.Technical]: "Include methodologies, approaches, techniques, and technologies to be used. Reference any relevant standards or best practices.",
  },
  'deliverables': {
    [HelpCharacter.Expert]: "Each deliverable should be specific, measurable, and tied to business value. Define acceptance criteria when possible.",
    [HelpCharacter.Coach]: "Make deliverables tangible! The client should easily visualize what they're getting and how it benefits them.",
    [HelpCharacter.Analyst]: "Proposals with quantifiable deliverables have a 27% higher close rate than those with vague outcomes.",
    [HelpCharacter.Friend]: "Think of this as a shopping list for the client - they should be excited about receiving each item!",
    [HelpCharacter.Technical]: "For each deliverable, specify format, medium, technical specifications, and any dependencies or prerequisites.",
  },
  'timeline': {
    [HelpCharacter.Expert]: "Include key milestones, dependencies, and critical path items. Build in reasonable buffer time for review cycles.",
    [HelpCharacter.Coach]: "A clear timeline builds confidence. Show thoughtful planning with realistic dates and highlight key decision points.",
    [HelpCharacter.Analyst]: "Projects with detailed timelines are completed on schedule 35% more often than those with minimal scheduling details.",
    [HelpCharacter.Friend]: "Everyone appreciates knowing when things will happen! Be realistic - it's better to over-deliver than under-promise.",
    [HelpCharacter.Technical]: "Use a Gantt chart format with weeks/months as columns. Include task duration, dependencies, resources assigned, and completion criteria.",
  },
  'pricing': {
    [HelpCharacter.Expert]: "Break down pricing by deliverable or phase. Demonstrate the value-to-cost ratio clearly to justify your pricing.",
    [HelpCharacter.Coach]: "Don't just list prices - explain the value behind each investment. Show why your solution is worth every penny!",
    [HelpCharacter.Analyst]: "Tiered pricing options increase conversion rates by 36% compared to single-price proposals.",
    [HelpCharacter.Friend]: "Be upfront about costs - nobody likes surprise fees! Consider offering options at different price points.",
    [HelpCharacter.Technical]: "Include unit costs, quantities, subtotals, discounts, taxes, and total amounts. Specify payment terms, method, and schedule.",
  },
  'terms': {
    [HelpCharacter.Expert]: "Include key legal protections while keeping language straightforward. Cover payment terms, cancellation policy, and IP ownership.",
    [HelpCharacter.Coach]: "Clear terms protect both you and the client. Focus on creating a fair partnership with reasonable expectations.",
    [HelpCharacter.Analyst]: "Proposals with transparent terms experience 45% fewer disputes during project execution.",
    [HelpCharacter.Friend]: "Think of terms as ground rules for a successful relationship. They should feel fair and reasonable to both sides!",
    [HelpCharacter.Technical]: "Include contract duration, renewal terms, termination conditions, liability limitations, confidentiality requirements, and dispute resolution procedures.",
  }
};

// Character avatar components - render functions
const renderCharacterAvatar = (character: HelpCharacter) => {
  switch (character) {
    case HelpCharacter.Expert:
      return (
        <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
          <User className="h-5 w-5" />
        </div>
      );
    case HelpCharacter.Coach:
      return (
        <div className="bg-green-100 text-green-700 p-2 rounded-full">
          <Lightbulb className="h-5 w-5" />
        </div>
      );
    case HelpCharacter.Analyst:
      return (
        <div className="bg-purple-100 text-purple-700 p-2 rounded-full">
          <Info className="h-5 w-5" />
        </div>
      );
    case HelpCharacter.Friend:
      return (
        <div className="bg-amber-100 text-amber-700 p-2 rounded-full">
          <MessageSquare className="h-5 w-5" />
        </div>
      );
    case HelpCharacter.Technical:
      return (
        <div className="bg-neutral-100 text-neutral-700 p-2 rounded-full">
          <AlertTriangle className="h-5 w-5" />
        </div>
      );
  }
};

// Character names
const characterNames: Record<HelpCharacter, string> = {
  [HelpCharacter.Expert]: 'Proposal Expert',
  [HelpCharacter.Coach]: 'Proposal Coach',
  [HelpCharacter.Analyst]: 'Data Analyst',
  [HelpCharacter.Friend]: 'Friendly Advisor',
  [HelpCharacter.Technical]: 'Technical Specialist',
};

interface ContextualHelpTooltipProps {
  context: string;
  preferredCharacter?: HelpCharacter;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  iconClassName?: string;
}

export function ContextualHelpTooltip({
  context,
  preferredCharacter = HelpCharacter.Expert,
  placement = 'top',
  className,
  iconClassName,
}: ContextualHelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-6 w-6 rounded-full border border-neutral-200 bg-white p-0 text-neutral-500 hover:text-primary-500 hover:border-primary-200", className)}
          >
            <HelpCircle className={cn("h-3.5 w-3.5", iconClassName)} />
            <span className="sr-only">Show help</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side={placement} 
          className="w-80 p-0 bg-white rounded-lg shadow-lg border-neutral-200" 
          sideOffset={5}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Character avatar */}
              {renderCharacterAvatar(preferredCharacter)}
              
              <div className="flex-1">
                {/* Character name */}
                <h4 className="text-sm font-semibold mb-1">
                  {characterNames[preferredCharacter]}
                </h4>
                
                {/* Help message */}
                <p className="text-sm text-neutral-700">
                  {helpMessages[context]?.[preferredCharacter] || 
                   "Help information not available for this context."}
                </p>
              </div>
            </div>
          </div>
          
          {/* Other characters */}
          <div className="border-t border-neutral-100 p-2 bg-neutral-50 rounded-b-lg flex justify-between items-center">
            <div className="flex space-x-1">
              {Object.values(HelpCharacter)
                .filter(character => character !== preferredCharacter)
                .slice(0, 3)
                .map(character => (
                  <TooltipProvider key={character}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full p-0"
                        >
                          {renderCharacterAvatar(character)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="p-2">
                        <p className="text-xs">{characterNames[character]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </div>
            
            <div className="text-xs text-neutral-500">
              Tap to get different perspectives
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ExpandedHelpPanelProps {
  context: string;
  title: string;
  onClose: () => void;
}

export function ExpandedHelpPanel({
  context,
  title,
  onClose,
}: ExpandedHelpPanelProps) {
  const [activeCharacter, setActiveCharacter] = useState<HelpCharacter>(HelpCharacter.Expert);
  
  return (
    <Card className="border border-neutral-200 rounded-lg shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-primary-500" />
            Help: {title}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Character tabs */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {Object.values(HelpCharacter).map(character => (
            <Button
              key={character}
              variant={activeCharacter === character ? "default" : "outline"}
              size="sm"
              className="flex items-center"
              onClick={() => setActiveCharacter(character)}
            >
              <div className="mr-2 h-5 w-5">
                {renderCharacterAvatar(character)}
              </div>
              {characterNames[character]}
            </Button>
          ))}
        </div>
        
        {/* Content from active character */}
        <div className="p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {renderCharacterAvatar(activeCharacter)}
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">
                {characterNames[activeCharacter]}
              </h4>
              <p className="text-neutral-700">
                {helpMessages[context]?.[activeCharacter] || 
                 "Help information not available for this context."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper hook to manage contextual help across the application
export function useContextualHelp() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentContext, setCurrentContext] = useState<{
    key: string;
    title: string;
  } | null>(null);
  
  const showHelp = (context: string, title: string) => {
    setCurrentContext({ key: context, title });
    setIsExpanded(true);
  };
  
  const hideHelp = () => {
    setIsExpanded(false);
  };
  
  return {
    isHelpExpanded: isExpanded,
    currentHelpContext: currentContext,
    showHelp,
    hideHelp,
  };
}

export default ContextualHelpTooltip;