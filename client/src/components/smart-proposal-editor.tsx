import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  KeywordHighlighter,
  KeywordLegend,
  SectionType,
  KeywordType
} from '@/components/keyword-highlighter';
import { Eye, Edit2, Lightbulb, List, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import ContextualHelpTooltip, { HelpCharacter } from './contextual-help-tooltips';

interface ProposalSection {
  id: keyof typeof SectionType;
  label: string;
  placeholder: string;
  type: SectionType;
  description: string;
  recommendedLength?: string;
  keyTips?: string[];
}

const proposalSections: ProposalSection[] = [
  {
    id: 'ExecutiveSummary',
    label: 'Executive Summary',
    placeholder: 'Provide a brief overview of the proposal...',
    type: SectionType.ExecutiveSummary,
    description: 'A concise summary of your proposal, highlighting key benefits and solutions.',
    recommendedLength: '150-250 words',
    keyTips: [
      'Focus on value proposition',
      'Highlight key benefits',
      'Include a compelling hook',
      'Address client pain points'
    ]
  },
  {
    id: 'ScopeOfWork',
    label: 'Scope of Work',
    placeholder: 'Define the work to be performed...',
    type: SectionType.ScopeOfWork,
    description: 'Detailed description of the work to be performed, methodologies, and approaches.',
    recommendedLength: '300-500 words',
    keyTips: [
      'Be specific about deliverables',
      'Define methodologies clearly',
      'Include technical specifications',
      'Clarify boundaries of work'
    ]
  },
  {
    id: 'Deliverables',
    label: 'Deliverables',
    placeholder: 'List the specific deliverables...',
    type: SectionType.Deliverables,
    description: 'Specific items, services, or results that will be delivered to the client.',
    keyTips: [
      'Use bullet points for clarity',
      'Specify formats (e.g., PDF, source files)',
      'Include quantity where applicable',
      'Note delivery methods'
    ]
  },
  {
    id: 'Timeline',
    label: 'Timeline',
    placeholder: 'Outline the project timeline...',
    type: SectionType.Timeline,
    description: 'Schedule of work, milestones, and deadlines for the project.',
    keyTips: [
      'Include specific dates',
      'Highlight key milestones',
      'Account for review periods',
      'Note dependencies'
    ]
  },
  {
    id: 'PricingDetails',
    label: 'Pricing Details',
    placeholder: 'Specify the pricing structure...',
    type: SectionType.PricingDetails,
    description: 'Detailed breakdown of costs, payment schedule, and terms.',
    keyTips: [
      'Break down costs by line item',
      'Include payment schedule',
      'Note any discounts applied',
      'Specify currency and tax status'
    ]
  },
  {
    id: 'Terms',
    label: 'Terms & Conditions',
    placeholder: 'Outline the terms and conditions...',
    type: SectionType.Terms,
    description: 'Legal terms, conditions, warranties, and other contractual details.',
    keyTips: [
      'Include cancellation policy',
      'Specify warranty information',
      'Note intellectual property rights',
      'Address confidentiality'
    ]
  }
];

interface SmartProposalEditorProps {
  initialValues?: Record<string, string>;
  onChange?: (values: Record<string, string>) => void;
  readOnly?: boolean;
}

export const SmartProposalEditor: React.FC<SmartProposalEditorProps> = ({
  initialValues = {},
  onChange,
  readOnly = false,
}) => {
  const [activeSection, setActiveSection] = useState<string>(proposalSections[0].id);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [sectionValues, setSectionValues] = useState<Record<string, string>>(
    proposalSections.reduce((acc, section) => {
      acc[section.id] = initialValues[section.id] || '';
      return acc;
    }, {} as Record<string, string>)
  );

  // Update parent component when values change
  useEffect(() => {
    if (onChange) {
      onChange(sectionValues);
    }
  }, [sectionValues, onChange]);

  // Handle section content change
  const handleSectionChange = (sectionId: string, value: string) => {
    setSectionValues(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  // Get the currently active section
  const getCurrentSection = (): ProposalSection => {
    return proposalSections.find(s => s.id === activeSection) || proposalSections[0];
  };

  // Get the relevant keyword types for the current section
  const getKeywordTypesForSection = (sectionType: SectionType): KeywordType[] => {
    switch (sectionType) {
      case SectionType.ExecutiveSummary:
        return [KeywordType.Positive, KeywordType.Technical, KeywordType.Financial];
      case SectionType.ScopeOfWork:
        return [KeywordType.Technical, KeywordType.Deadline];
      case SectionType.Deliverables:
        return [KeywordType.Technical, KeywordType.Positive, KeywordType.Deadline];
      case SectionType.Timeline:
        return [KeywordType.Deadline, KeywordType.Risk];
      case SectionType.PricingDetails:
        return [KeywordType.Financial, KeywordType.Legal];
      case SectionType.Terms:
        return [KeywordType.Legal, KeywordType.Risk, KeywordType.Financial];
      default:
        return Object.values(KeywordType);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sections navigation */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Proposal Sections</h3>
          <div className="space-y-1">
            {proposalSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
                  activeSection === section.id
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{section.label}</span>
                {sectionValues[section.id] ? (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {sectionValues[section.id].length} chars
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Empty
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor pane */}
      <Card className="lg:col-span-3">
        <Tabs defaultValue="edit" onValueChange={(v) => setEditorMode(v as 'edit' | 'preview')}>
          <div className="flex justify-between items-center border-b px-4 py-2">
            <div>
              <h3 className="text-lg font-medium">{getCurrentSection().label}</h3>
              <p className="text-sm text-gray-500">{getCurrentSection().description}</p>
            </div>
            <TabsList>
              <TabsTrigger value="edit" disabled={readOnly}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="p-4 space-y-4">
            <div className="flex justify-between">
              {getCurrentSection().recommendedLength && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Info className="h-3 w-3 mr-1" />
                  Recommended: {getCurrentSection().recommendedLength}
                </Badge>
              )}

              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7">
                        <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                        <span className="text-xs">Key Tips</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="w-64">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Tips for {getCurrentSection().label}</p>
                        {getCurrentSection().keyTips ? (
                          <ul className="text-xs space-y-1">
                            {getCurrentSection().keyTips?.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-primary-500 mr-1">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Contextual help tooltip */}
                <ContextualHelpTooltip 
                  context={getCurrentSection().id.toLowerCase()} 
                  preferredCharacter={
                    // Select character based on section type
                    getCurrentSection().id === 'PricingDetails' ? 
                      HelpCharacter.Analyst : 
                    getCurrentSection().id === 'ScopeOfWork' || getCurrentSection().id === 'Deliverables' ? 
                      HelpCharacter.Technical : 
                    getCurrentSection().id === 'ExecutiveSummary' ? 
                      HelpCharacter.Expert : 
                    getCurrentSection().id === 'Terms' ? 
                      HelpCharacter.Friend : 
                      HelpCharacter.Coach
                  }
                />
              </div>
            </div>

            <div>
              <Textarea
                placeholder={getCurrentSection().placeholder}
                value={sectionValues[activeSection] || ''}
                onChange={(e) => handleSectionChange(activeSection, e.target.value)}
                className="min-h-[300px] font-sans"
                disabled={readOnly}
              />
            </div>
            
            <div className="pt-2">
              <Label className="text-xs text-gray-500 flex items-center">
                <List className="h-3 w-3 mr-1" />
                Keywords detected for this section:
              </Label>
              <div className="mt-1">
                <KeywordLegend visibleTypes={getKeywordTypesForSection(getCurrentSection().type)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="p-4">
            <Card className="border border-gray-200 p-4 bg-gray-50 min-h-[300px]">
              {sectionValues[activeSection] ? (
                <KeywordHighlighter
                  text={sectionValues[activeSection]}
                  sectionType={getCurrentSection().type}
                  className="prose max-w-none"
                />
              ) : (
                <div className="text-gray-400 italic">No content for this section yet.</div>
              )}
            </Card>
            <div className="mt-4 pt-2 border-t">
              <Label className="text-xs text-gray-500 mb-2 block">Keywords highlighted:</Label>
              <KeywordLegend visibleTypes={getKeywordTypesForSection(getCurrentSection().type)} />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SmartProposalEditor;