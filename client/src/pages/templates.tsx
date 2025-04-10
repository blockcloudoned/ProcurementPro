import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const Templates = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId);
    toast({
      title: "Template selected",
      description: "Template has been selected. You can now create a proposal.",
    });
  };

  const filterTemplatesByCategory = (category: string) => {
    if (category === "all") return templates;
    return templates?.filter(template => template.category === category);
  };

  const displayedTemplates = filterTemplatesByCategory(selectedTab);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9 sm:truncate">
              Proposal Templates
            </h2>
          </div>
        </div>

        {/* Tabs for template categories */}
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="Professional Services">Professional Services</TabsTrigger>
            <TabsTrigger value="Product Sales">Product Sales</TabsTrigger>
            <TabsTrigger value="Project Proposal">Project Proposal</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Template grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-1" />
                </CardContent>
              </Card>
            ))
          ) : displayedTemplates?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No templates found</h3>
              <p className="text-neutral-500">No templates available for the selected category.</p>
            </div>
          ) : (
            displayedTemplates?.map((template) => (
              <div 
                key={template.id}
                className={cn(
                  "relative border rounded-lg overflow-hidden bg-white hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group",
                  selectedTemplateId === template.id ? "border-primary-500" : "border-neutral-200"
                )}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="h-48 bg-neutral-100 relative">
                  {template.category === "Professional Services" && (
                    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {template.category === "Product Sales" && (
                    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-emerald-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  )}
                  
                  {template.category === "Project Proposal" && (
                    <div className="w-full h-full bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-neutral-900">{template.name}</h4>
                  <p className="text-sm text-neutral-500 mt-1">{template.description}</p>
                </div>
                {template.isDefault && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Popular
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex items-center">
          <Link href={selectedTemplateId ? `/create-proposal?templateId=${selectedTemplateId}` : "/create-proposal"}>
            <Button disabled={!selectedTemplateId}>
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Continue with Selected Template
            </Button>
          </Link>
          <span className="text-sm text-neutral-500 ml-4">or</span>
          <Link href="/create-proposal">
            <Button variant="outline" className="ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start From Scratch
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Templates;
