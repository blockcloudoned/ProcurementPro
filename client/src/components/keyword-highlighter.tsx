import React from 'react';
import { cn } from '@/lib/utils';

// Enum for proposal section types
export enum SectionType {
  ExecutiveSummary = 'executiveSummary',
  ScopeOfWork = 'scopeOfWork',
  Deliverables = 'deliverables',
  Timeline = 'timeline',
  PricingDetails = 'pricingDetails',
  Terms = 'terms'
}

// Enum for keyword types
export enum KeywordType {
  Positive = 'positive',
  Negative = 'negative',
  Technical = 'technical',
  Financial = 'financial',
  Legal = 'legal',
  Risk = 'risk',
  Deadline = 'deadline'
}

// Keyword definitions by type
const keywords: Record<KeywordType, string[]> = {
  [KeywordType.Positive]: [
    'benefit', 'advantage', 'improve', 'enhance', 'optimize', 'efficiency',
    'effective', 'success', 'value', 'quality', 'opportunity', 'solution',
    'innovative', 'leading', 'best-in-class', 'proven', 'trusted', 'reliable',
    'scalable', 'flexible', 'seamless', 'boost', 'maximize', 'exceptional'
  ],
  [KeywordType.Negative]: [
    'fail', 'loss', 'problem', 'issue', 'difficulty', 'challenge',
    'limitation', 'risk', 'inability', 'difficult', 'complex', 'complicated',
    'obstacle', 'shortcoming', 'weakness', 'threat', 'disadvantage'
  ],
  [KeywordType.Technical]: [
    'implement', 'technology', 'system', 'platform', 'architecture', 'infrastructure',
    'solution', 'framework', 'database', 'cloud', 'security', 'interface',
    'integration', 'algorithm', 'protocol', 'methodology', 'api', 'function',
    'deployment', 'code', 'development', 'application', 'automation', 'configuration'
  ],
  [KeywordType.Financial]: [
    'cost', 'price', 'investment', 'budget', 'expense', 'payment', 'fee',
    'revenue', 'profit', 'saving', 'return', 'value', 'roi', 'pricing',
    'discount', 'financing', 'economic', 'monetary', 'fiscal', 'funding',
    'capital', 'dollar', 'financial', 'allocation', 'resources'
  ],
  [KeywordType.Legal]: [
    'agreement', 'contract', 'terms', 'condition', 'obligation', 'provision',
    'compliance', 'regulation', 'requirement', 'law', 'policy', 'guideline',
    'standard', 'license', 'warranty', 'liability', 'indemnification',
    'confidentiality', 'intellectual property', 'rights', 'termination',
    'cancellation', 'ownership', 'jurisdiction', 'governing law'
  ],
  [KeywordType.Risk]: [
    'risk', 'issue', 'challenge', 'concern', 'threat', 'liability',
    'uncertainty', 'vulnerability', 'exposure', 'danger', 'hazard',
    'contingency', 'complication', 'disruption', 'security', 'breach',
    'failure', 'damage', 'loss', 'incident', 'compromise', 'conflict'
  ],
  [KeywordType.Deadline]: [
    'deadline', 'timeline', 'schedule', 'milestone', 'date', 'due',
    'delivery', 'timeframe', 'period', 'duration', 'phase', 'stage',
    'timing', 'completion', 'finish', 'commence', 'initiate', 'begin',
    'start', 'end', 'day', 'week', 'month', 'quarter', 'year',
    'january', 'february', 'march', 'april', 'may', 'june', 'july',
    'august', 'september', 'october', 'november', 'december'
  ]
};

// Style mappings for different keyword types
const keywordStyles: Record<KeywordType, string> = {
  [KeywordType.Positive]: 'bg-green-100 text-green-800 border-b border-green-200',
  [KeywordType.Negative]: 'bg-red-100 text-red-800 border-b border-red-200',
  [KeywordType.Technical]: 'bg-blue-100 text-blue-800 border-b border-blue-200',
  [KeywordType.Financial]: 'bg-purple-100 text-purple-800 border-b border-purple-200',
  [KeywordType.Legal]: 'bg-neutral-100 text-neutral-800 border-b border-neutral-200',
  [KeywordType.Risk]: 'bg-orange-100 text-orange-800 border-b border-orange-200',
  [KeywordType.Deadline]: 'bg-amber-100 text-amber-800 border-b border-amber-200'
};

// Descriptions for keyword types
const keywordDescriptions: Record<KeywordType, string> = {
  [KeywordType.Positive]: 'Positive language that emphasizes benefits and value',
  [KeywordType.Negative]: 'Negative terms that may weaken your proposal',
  [KeywordType.Technical]: 'Technical terms that demonstrate expertise',
  [KeywordType.Financial]: 'Financial terms related to costs, pricing, and value',
  [KeywordType.Legal]: 'Legal or contractual language',
  [KeywordType.Risk]: 'Terms that address or highlight potential risks',
  [KeywordType.Deadline]: 'Time-related terms for schedules and deadlines'
};

// Interface for the KeywordHighlighter component
interface KeywordHighlighterProps {
  text: string;
  sectionType: SectionType;
  className?: string;
}

// Interface for the KeywordLegend component
interface KeywordLegendProps {
  visibleTypes: KeywordType[];
}

/**
 * Checks if a word is part of a keyword phrase
 */
const isKeyword = (word: string, keywordType: KeywordType): boolean => {
  word = word.toLowerCase().replace(/[.,;:!?()[\]{}'"]/g, '');
  return keywords[keywordType].some(keyword => {
    if (keyword.includes(' ')) {
      // For multi-word keywords, check if word is part of any
      return keyword.split(' ').includes(word);
    }
    return keyword === word;
  });
};

/**
 * Determines which keyword type a word belongs to
 */
const getKeywordType = (word: string, allowedTypes: KeywordType[]): KeywordType | null => {
  for (const type of allowedTypes) {
    if (isKeyword(word, type)) {
      return type;
    }
  }
  return null;
};

/**
 * Get the relevant keyword types for a specific section
 */
export const getRelevantKeywordTypes = (sectionType: SectionType): KeywordType[] => {
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

/**
 * Component to display a legend of different keyword types
 */
export const KeywordLegend: React.FC<KeywordLegendProps> = ({ visibleTypes }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {visibleTypes.map(type => (
        <div key={type} className="flex items-center">
          <span className={cn("inline-block h-3 w-3 rounded-sm mr-1", keywordStyles[type])}></span>
          <span className="text-xs text-neutral-600">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
        </div>
      ))}
    </div>
  );
};

/**
 * Component to highlight keywords in text based on their type
 */
export const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({ 
  text, 
  sectionType,
  className 
}) => {
  // Get relevant keyword types for this section
  const relevantKeywordTypes = getRelevantKeywordTypes(sectionType);

  // Process text to highlight keywords
  const processText = () => {
    // Split by paragraphs to maintain them
    const paragraphs = text.split('\n');
    
    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) {
        return <p key={pIndex}>&nbsp;</p>;
      }
      
      // Split paragraph into words
      const words = paragraph.split(/(\s+)/);
      
      // Process each word
      const processedWords = words.map((word, wIndex) => {
        // Skip spaces/punctuation
        if (!word.trim() || /^[.,;:!?()[\]{}'"]+$/.test(word)) {
          return word;
        }
        
        const keywordType = getKeywordType(word, relevantKeywordTypes);
        
        if (keywordType) {
          return (
            <span 
              key={wIndex} 
              className={keywordStyles[keywordType]}
              title={keywordDescriptions[keywordType]}
            >
              {word}
            </span>
          );
        }
        
        return word;
      });
      
      return <p key={pIndex} className="mb-4">{processedWords}</p>;
    });
  };

  return (
    <div className={className}>
      {processText()}
    </div>
  );
};

export default KeywordHighlighter;