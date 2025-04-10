import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TemplateSelectionProps {
  selectedTemplateId: number;
  onSelectTemplate: (templateId: number) => void;
}

const TemplateSelection = ({ selectedTemplateId, onSelectTemplate }: TemplateSelectionProps) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border rounded-lg">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <h4 className="text-lg font-medium text-neutral-900 mb-2">No templates available</h4>
        <p className="text-neutral-500">There are no proposal templates available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div 
          key={template.id}
          className={cn(
            "relative border rounded-lg overflow-hidden bg-white hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group",
            selectedTemplateId === template.id ? "border-primary-500" : "border-neutral-200"
          )}
          onClick={() => onSelectTemplate(template.id)}
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
      ))}
    </div>
  );
};

export default TemplateSelection;
