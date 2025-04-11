import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileText, 
  FileType, 
  Download,
  Loader2, 
  ChevronDown,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ExportProposalButtonProps {
  proposalId: number;
  proposalTitle?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const exportFormats = [
  { id: 'pdf', name: 'PDF Document', icon: FileText, contentType: 'application/pdf' },
  { id: 'docx', name: 'Word Document', icon: FileType, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'html', name: 'HTML Page', icon: FileType, contentType: 'text/html' },
];

export function ExportProposalButton({ 
  proposalId, 
  proposalTitle,
  variant = 'default',
  size = 'default'
}: ExportProposalButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<string | null>(null);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<{[key: string]: 'pending' | 'complete' | 'error'}>({});
  const { toast } = useToast();

  const downloadFile = (blob: Blob, filename: string) => {
    // Create a hidden anchor element for downloading
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Set up the download link
    link.href = url;
    link.download = filename;
    
    // Trigger the download
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const handleExport = async (format: string) => {
    try {
      setIsExporting(true);
      setCurrentFormat(format);

      // Make the request to the export endpoint
      const response = await fetch(`/api/proposals/${proposalId}/export?format=${format}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Set up the filename
      const filename = proposalTitle 
        ? `proposal_${proposalId}_${proposalTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.${format}`
        : `proposal_${proposalId}.${format}`;
      
      // Download the file
      downloadFile(blob, filename);
      
      toast({
        title: "Export successful",
        description: `Proposal has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: (error as Error).message || "An error occurred during export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setCurrentFormat(null);
    }
  };

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      setShowExportProgress(true);
      
      // Initialize export statuses
      const initialStatuses: {[key: string]: 'pending' | 'complete' | 'error'} = {};
      exportFormats.forEach(format => {
        initialStatuses[format.id] = 'pending';
      });
      setExportStatus(initialStatuses);
      
      // Export each format one by one
      for (let i = 0; i < exportFormats.length; i++) {
        const format = exportFormats[i];
        setCurrentFormat(format.id);
        
        try {
          // Update progress
          setExportProgress(Math.round((i / exportFormats.length) * 100));
          
          // Make the request to the export endpoint
          const response = await fetch(`/api/proposals/${proposalId}/export?format=${format.id}`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error(`Export failed: ${response.statusText}`);
          }
          
          // Get the blob from the response
          const blob = await response.blob();
          
          // Set up the filename
          const filename = proposalTitle 
            ? `proposal_${proposalId}_${proposalTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.${format.id}`
            : `proposal_${proposalId}.${format.id}`;
          
          // Download the file
          downloadFile(blob, filename);
          
          // Update status
          setExportStatus(prev => ({
            ...prev,
            [format.id]: 'complete'
          }));
          
        } catch (error) {
          console.error(`Error exporting ${format.id}:`, error);
          
          // Update status to error
          setExportStatus(prev => ({
            ...prev,
            [format.id]: 'error'
          }));
        }
      }
      
      // Complete progress
      setExportProgress(100);
      
      toast({
        title: "Export completed",
        description: "All requested formats have been exported",
      });
      
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: (error as Error).message || "An error occurred during export",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setCurrentFormat(null);
        setShowExportProgress(false);
        setExportProgress(0);
      }, 2000); // Give user a chance to see the completed progress
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export Proposal
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isExporting}
            onClick={handleExportAll}
            className="font-medium"
          >
            <div className="flex items-center">
              <Archive className="mr-2 h-4 w-4" />
              Export All Formats
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {exportFormats.map((format) => (
            <DropdownMenuItem
              key={format.id}
              disabled={isExporting}
              onClick={() => handleExport(format.id)}
            >
              <div className="flex items-center">
                {isExporting && currentFormat === format.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <format.icon className="mr-2 h-4 w-4" />
                )}
                Export as {format.name}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={showExportProgress} onOpenChange={setShowExportProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporting Proposal in All Formats</DialogTitle>
            <DialogDescription>
              Generating and downloading all document formats...
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Progress value={exportProgress} className="h-2 mb-4" />
            
            <div className="space-y-3">
              {exportFormats.map(format => (
                <div key={format.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <format.icon className="mr-2 h-4 w-4" />
                    <span>{format.name}</span>
                  </div>
                  
                  <div>
                    {exportStatus[format.id] === 'pending' && (
                      <div className="text-sm text-gray-500">Pending</div>
                    )}
                    {exportStatus[format.id] === 'complete' && (
                      <div className="text-sm text-green-500 flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Complete
                      </div>
                    )}
                    {exportStatus[format.id] === 'error' && (
                      <div className="text-sm text-red-500">Failed</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowExportProgress(false)}
              disabled={isExporting && exportProgress < 100}
            >
              {exportProgress < 100 ? 'Processing...' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}