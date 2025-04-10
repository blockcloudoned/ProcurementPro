import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import TemplateSelection from "@/components/template-selection";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Form schema for proposal details
const proposalDetailsSchema = z.object({
  title: z.string().min(1, "Proposal title is required"),
  templateId: z.number().min(1, "Please select a template"),
  content: z.record(z.string().optional()).optional(),
});

type ProposalDetailsFormValues = z.infer<typeof proposalDetailsSchema>;

interface ProposalDetailsProps {
  proposalData: any;
  updateProposalData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ProposalDetails = ({ proposalData, updateProposalData, onNext, onPrev }: ProposalDetailsProps) => {
  const { toast } = useToast();
  
  // Fetch template for the selected template ID
  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: [`/api/templates/${proposalData.templateId}`],
    enabled: !!proposalData.templateId,
  });

  // Form setup
  const form = useForm<ProposalDetailsFormValues>({
    resolver: zodResolver(proposalDetailsSchema),
    defaultValues: {
      title: proposalData.title || "",
      templateId: proposalData.templateId || 0,
      content: proposalData.content || {},
    },
  });

  // Update form when template changes
  useEffect(() => {
    if (selectedTemplate) {
      // Create initial content structure based on the template sections
      const initialContent: Record<string, string> = {};
      selectedTemplate.content.sections.forEach((section: { title: string, content: string }) => {
        initialContent[section.title] = section.content || "";
      });
      
      form.setValue("content", initialContent);
    }
  }, [selectedTemplate, form]);

  // Form submission
  const onSubmit = (data: ProposalDetailsFormValues) => {
    updateProposalData({
      title: data.title,
      templateId: data.templateId,
      content: data.content
    });
    
    toast({
      title: "Proposal details saved",
      description: "Your proposal details have been saved.",
    });
    
    onNext();
  };

  // Handle template selection
  const handleSelectTemplate = (templateId: number) => {
    form.setValue("templateId", templateId);
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
        Proposal Details
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Proposal title */}
          <div className="mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Cloud Migration Services for TechSolutions Inc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Template selection */}
          <div className="mb-6">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Template</FormLabel>
                  <FormControl>
                    <TemplateSelection 
                      selectedTemplateId={field.value} 
                      onSelectTemplate={handleSelectTemplate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Template content editor */}
          {form.watch("templateId") > 0 && (
            <div className="mb-6">
              <h4 className="text-base font-medium mb-4">Proposal Content</h4>
              
              {isLoadingTemplate ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTemplate?.content.sections.map((section: { title: string, content: string }, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <FormField
                          control={form.control}
                          name={`content.${section.title}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{section.title}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={`Enter ${section.title.toLowerCase()} content here...`} 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Continue to Pricing & Terms
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProposalDetails;
