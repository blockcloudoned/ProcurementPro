import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  History,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  Edit,
  Eye,
  RotateCcw,
  DiffIcon,
  ArrowLeftRight,
  Check
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface Version {
  id: number;
  proposalId: number;
  versionNumber: number;
  createdBy: string;
  createdAt: string;
  changes?: {
    type: 'added' | 'removed' | 'modified';
    section: string;
    before?: string;
    after?: string;
  }[];
  comment?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'archived';
}

interface ProposalVersionTimelineProps {
  versions: Version[];
  currentVersionId?: number;
  onSelectVersion?: (versionId: number) => void;
  onCompareVersions?: (fromVersionId: number, toVersionId: number) => void;
  onRestoreVersion?: (versionId: number) => void;
  readonly?: boolean;
}

export const ProposalVersionTimeline: React.FC<ProposalVersionTimelineProps> = ({
  versions,
  currentVersionId,
  onSelectVersion,
  onCompareVersions,
  onRestoreVersion,
  readonly = false,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(
    versions.find(v => v.id === currentVersionId) || null
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareFromVersion, setCompareFromVersion] = useState<Version | null>(null);
  const [compareToVersion, setCompareToVersion] = useState<Version | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null);
  
  const { toast } = useToast();

  // Sort versions by version number (descending)
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  
  // Format date string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Format time string
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle version selection
  const handleSelectVersion = (version: Version) => {
    if (compareMode) {
      if (!compareFromVersion) {
        setCompareFromVersion(version);
      } else if (!compareToVersion) {
        setCompareToVersion(version);
        setShowCompareDialog(true);
      }
    } else {
      setSelectedVersion(version);
      if (onSelectVersion) {
        onSelectVersion(version.id);
      }
    }
  };
  
  // Handle compare mode toggle
  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
    setCompareFromVersion(null);
    setCompareToVersion(null);
  };
  
  // Handle compare versions
  const handleCompare = () => {
    if (compareFromVersion && compareToVersion && onCompareVersions) {
      onCompareVersions(compareFromVersion.id, compareToVersion.id);
      setShowCompareDialog(false);
      setCompareMode(false);
      
      toast({
        title: "Comparing versions",
        description: `Comparing version ${compareFromVersion.versionNumber} with version ${compareToVersion.versionNumber}`,
      });
    }
  };
  
  // Handle cancel compare
  const handleCancelCompare = () => {
    setShowCompareDialog(false);
    setCompareFromVersion(null);
    setCompareToVersion(null);
  };
  
  // Handle restore version
  const handleRestoreVersion = (version: Version) => {
    setVersionToRestore(version);
    setShowRestoreDialog(true);
  };
  
  // Handle confirm restore
  const handleConfirmRestore = () => {
    if (versionToRestore && onRestoreVersion) {
      onRestoreVersion(versionToRestore.id);
      setShowRestoreDialog(false);
      
      toast({
        title: "Version restored",
        description: `Version ${versionToRestore.versionNumber} has been restored`,
      });
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: Version['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'archived':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center">
              <History className="mr-2 h-5 w-5" />
              Version History
            </CardTitle>
            
            {!readonly && versions.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleCompareMode}
                className={compareMode ? 'bg-primary-100' : ''}
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                {compareMode ? 'Cancel Compare' : 'Compare Versions'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {compareMode && (
            <div className="mb-4 p-3 bg-primary-50 rounded-md border border-primary-100 text-sm">
              <p className="font-medium flex items-center">
                <DiffIcon className="mr-2 h-4 w-4" />
                {!compareFromVersion ? (
                  "Select the first version to compare"
                ) : !compareToVersion ? (
                  "Now select the second version to compare"
                ) : (
                  "Both versions selected for comparison"
                )}
              </p>
            </div>
          )}
          
          <div className="relative">
            {/* Timeline track */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
            
            {/* Version timeline items */}
            <div className="space-y-4">
              {sortedVersions.map((version) => {
                const isSelected = selectedVersion?.id === version.id;
                const isCompareFrom = compareFromVersion?.id === version.id;
                const isCompareTo = compareToVersion?.id === version.id;
                
                return (
                  <div 
                    key={version.id}
                    className={`pl-10 relative ${isSelected ? 'bg-primary-50 -mx-4 px-4 py-2 rounded-md' : ''}`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-2 top-1.5 h-6 w-6 rounded-full flex items-center justify-center ${
                      isSelected || isCompareFrom || isCompareTo 
                        ? 'bg-primary-600 border-2 border-primary-200' 
                        : 'bg-white border-2 border-neutral-300'
                    }`}>
                      <span className="text-xs font-bold text-white">{version.versionNumber}</span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        {/* Version header */}
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium">
                            Version {version.versionNumber}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 text-xs ${getStatusColor(version.status)}`}
                          >
                            {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                          </Badge>
                          
                          {(isCompareFrom || isCompareTo) && (
                            <Badge className="ml-2 bg-primary-100 text-primary-800 border-primary-200">
                              {isCompareFrom ? 'From' : 'To'}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Version metadata */}
                        <div className="text-xs text-neutral-500 mt-1 space-y-1">
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            <span>{formatDate(version.createdAt)} at {formatTime(version.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="mr-1.5 h-3.5 w-3.5" />
                            <span>{version.createdBy}</span>
                          </div>
                          
                          {version.comment && (
                            <div className="mt-2 text-xs bg-neutral-50 p-2 rounded border border-neutral-100">
                              <q className="italic text-neutral-600">{version.comment}</q>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Version actions */}
                      <div className="flex space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSelectVersion(version)}
                              >
                                {isSelected ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isSelected ? 'Currently viewing' : 'View this version'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {!readonly && version.versionNumber < sortedVersions[0].versionNumber && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleRestoreVersion(version)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Restore this version</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    
                    {/* Changes summary */}
                    {version.changes && version.changes.length > 0 && (
                      <div className="mt-2 text-xs">
                        <details className="group">
                          <summary className="flex items-center cursor-pointer">
                            <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                            <span className="ml-1 text-neutral-600">{version.changes.length} changes</span>
                          </summary>
                          <div className="pl-4 mt-2 space-y-1.5">
                            {version.changes.map((change, index) => (
                              <div key={index} className="flex items-start">
                                {change.type === 'added' && (
                                  <Badge className="mt-0.5 h-4 px-1 bg-green-100 text-green-800 border-green-200">+</Badge>
                                )}
                                {change.type === 'removed' && (
                                  <Badge className="mt-0.5 h-4 px-1 bg-red-100 text-red-800 border-red-200">-</Badge>
                                )}
                                {change.type === 'modified' && (
                                  <Badge className="mt-0.5 h-4 px-1 bg-amber-100 text-amber-800 border-amber-200">~</Badge>
                                )}
                                <span className="ml-2 text-neutral-800">
                                  {change.section}{' '}
                                  <span className="text-neutral-500">
                                    {change.type === 'added' && 'added'}
                                    {change.type === 'removed' && 'removed'}
                                    {change.type === 'modified' && 'modified'}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Compare versions dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>
              You are about to compare the following versions:
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card className="border border-neutral-200">
              <CardContent className="p-4">
                <h4 className="font-medium flex items-center">
                  <Badge className="mr-2">From</Badge>
                  Version {compareFromVersion?.versionNumber}
                </h4>
                <p className="text-sm text-neutral-500 mt-1">
                  Created on {compareFromVersion ? formatDate(compareFromVersion.createdAt) : ''}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-neutral-200">
              <CardContent className="p-4">
                <h4 className="font-medium flex items-center">
                  <Badge className="mr-2">To</Badge>
                  Version {compareToVersion?.versionNumber}
                </h4>
                <p className="text-sm text-neutral-500 mt-1">
                  Created on {compareToVersion ? formatDate(compareToVersion.createdAt) : ''}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCompare}>Cancel</Button>
            <Button onClick={handleCompare}>
              <DiffIcon className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Restore version dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore version {versionToRestore?.versionNumber}? This will create a new version based on the restored one.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>Cancel</Button>
            <Button variant="default" onClick={handleConfirmRestore}>
              <Check className="mr-2 h-4 w-4" />
              Confirm Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProposalVersionTimeline;