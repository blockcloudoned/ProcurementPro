import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileText, 
  FileType, 
  Loader2, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ExportProposalButtonProps {
  proposalId: number;
  proposalTitle?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const exportFormats = [
  { id: 'pdf', name: 'PDF Document', icon: FileText },
  { id: 'docx', name: 'Word Document', icon: FileType },
  { id: 'html', name: 'HTML Page', icon: FileType },
];

export function ExportProposalButton({ 
  proposalId, 
  proposalTitle,
  variant = 'default',
  size = 'default'
}: ExportProposalButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: string) => {
    try {
      setIsExporting(true);
      setCurrentFormat(format);

      // Create a hidden anchor element for downloading
      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Make the request to the export endpoint
      const response = await fetch(`/api/proposals/${proposalId}/export?format=${format}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Set up the download link
      const filename = proposalTitle 
        ? `proposal_${proposalId}_${proposalTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.${format}`
        : `proposal_${proposalId}.${format}`;
        
      link.href = url;
      link.download = filename;
      
      // Trigger the download
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
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

  return (
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
  );
}