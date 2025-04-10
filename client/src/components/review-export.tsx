import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { File, FileText, Send, Download, Save, ArrowLeft } from "lucide-react";

interface ReviewExportProps {
  proposalData: any;
  onPrev: () => void;
  onSave: () => void;
  isSaving: boolean;
}

const ReviewExport = ({ proposalData, onPrev, onSave, isSaving }: ReviewExportProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("preview");
  
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: [`/api/clients/${proposalData.clientId}`],
    enabled: !!proposalData.clientId,
  });

  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: [`/api/templates/${proposalData.templateId}`],
    enabled: !!proposalData.templateId,
  });

  const exportProposalMutation = useMutation({
    mutationFn: async (format: string) => {
      const response = await apiRequest("POST", `/api/proposals/${proposalData.id}/export?format=${format}`, null);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export successful",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to export proposal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleExport = (format: string) => {
    // If proposal hasn't been saved yet, save it first
    if (!proposalData.id) {
      toast({
        title: "Save required",
        description: "Please save the proposal before exporting.",
      });
      return;
    }
    
    exportProposalMutation.mutate(format);
  };

  const formatCurrency = (amount: string, currency = "USD") => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });
    
    return formatter.format(Number(amount));
  };

  // Render the proposal preview
  const renderProposalPreview = () => {
    if (isLoadingClient || isLoadingTemplate) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6 border rounded-lg bg-white">
        {/* Header with company info */}
        <div className="border-b pb-6">
          <h1 className="text-2xl font-bold text-neutral-900">{proposalData.title}</h1>
          <p className="text-sm text-neutral-500 mt-2">Prepared for: {client?.companyName}</p>
          <p className="text-sm text-neutral-500">Date: {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Proposal content based on template */}
        <div className="space-y-6">
          {template?.content.sections.map((section: { title: string }, idx: number) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-lg font-medium text-neutral-900">{section.title}</h3>
              <div className="text-neutral-700 whitespace-pre-line">
                {proposalData.content[section.title] || 
                 <span className="text-neutral-400 italic">No content provided for this section</span>}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pricing information */}
        <div className="border-t pt-6 mt-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Pricing & Terms</h3>
          
          <div className="bg-neutral-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold">{formatCurrency(proposalData.amount)}</span>
            </div>
            
            {proposalData.content?.pricing && (
              <>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Payment Terms:</span>
                  <span>{proposalData.content.pricing.paymentTerms}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Validity:</span>
                  <span>{proposalData.content.pricing.validityPeriod}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Includes Tax:</span>
                  <span>{proposalData.content.pricing.includesTax ? "Yes" : "No"}</span>
                </div>
                
                {proposalData.content.pricing.additionalTerms && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-sm font-medium mb-1">Additional Terms:</p>
                    <p className="text-sm text-neutral-700">
                      {proposalData.content.pricing.additionalTerms}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
        Review & Export
      </h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="export">Export & Send</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="space-y-4">
          {renderProposalPreview()}
          
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="button" 
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Proposal
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Export your proposal in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                <div className="flex items-center">
                  <File className="h-8 w-8 text-red-500 mr-4" />
                  <div>
                    <h4 className="font-medium">PDF Document</h4>
                    <p className="text-sm text-neutral-500">Export as a professional PDF document</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleExport('pdf')}
                  disabled={exportProposalMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <h4 className="font-medium">Word Document (DOCX)</h4>
                    <p className="text-sm text-neutral-500">Export as an editable Word document</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleExport('docx')}
                  disabled={exportProposalMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Send Proposal</CardTitle>
              <CardDescription>
                Send this proposal directly to the client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600">
                Send the proposal directly to <strong>{client?.contactName}</strong> at <strong>{client?.email || "No email provided"}</strong>.
              </p>
              
              <Button 
                className="w-full" 
                disabled={!client?.email}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Proposal to Client
              </Button>
              
              {!client?.email && (
                <p className="text-sm text-amber-600">
                  Client email address is required to send the proposal.
                </p>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="button"
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Proposal
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewExport;
