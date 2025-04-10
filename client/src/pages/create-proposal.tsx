import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import ProposalSteps from "@/components/proposal-steps";
import ClientInformation from "@/components/client-information";
import ProposalDetails from "@/components/proposal-details";
import PricingTerms from "@/components/pricing-terms";
import ReviewExport from "@/components/review-export";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const CreateProposal = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalData, setProposalData] = useState({
    title: "",
    clientId: 0,
    templateId: 0,
    status: "draft",
    amount: "",
    content: {}
  });

  const createProposalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/proposals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Proposal saved",
        description: "Your proposal has been saved as a draft.",
        variant: "default",
      });
      setLocation("/my-proposals");
    },
    onError: (error) => {
      toast({
        title: "Error saving proposal",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveDraft = () => {
    createProposalMutation.mutate(proposalData);
  };

  const updateProposalData = (data: Partial<typeof proposalData>) => {
    setProposalData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9 sm:truncate">
              {proposalData.title || "New Business Proposal"}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button 
              variant="default" 
              onClick={handleSaveDraft}
              disabled={createProposalMutation.isPending}
            >
              <SaveIcon className="-ml-1 mr-2 h-5 w-5" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Create proposal content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ProposalSteps currentStep={currentStep} onStepChange={setCurrentStep} />

          <div className="p-6">
            {currentStep === 1 && (
              <ClientInformation 
                proposalData={proposalData} 
                updateProposalData={updateProposalData} 
                onNext={nextStep} 
              />
            )}
            
            {currentStep === 2 && (
              <ProposalDetails 
                proposalData={proposalData} 
                updateProposalData={updateProposalData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            
            {currentStep === 3 && (
              <PricingTerms 
                proposalData={proposalData} 
                updateProposalData={updateProposalData} 
                onNext={nextStep} 
                onPrev={prevStep} 
              />
            )}
            
            {currentStep === 4 && (
              <ReviewExport 
                proposalData={proposalData} 
                onPrev={prevStep} 
                onSave={handleSaveDraft}
                isSaving={createProposalMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
