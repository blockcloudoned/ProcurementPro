import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SiHubspot, SiSalesforce } from "react-icons/si";
import { Database } from "lucide-react";

// Form schema for client information
const clientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  contactName: z.string().optional(),
  contactTitle: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientInformationProps {
  proposalData: any;
  updateProposalData: (data: any) => void;
  onNext: () => void;
}

const ClientInformation = ({ proposalData, updateProposalData, onNext }: ClientInformationProps) => {
  const { toast } = useToast();
  const [crmImportOpen, setCrmImportOpen] = useState(false);
  
  // Get CRM connections
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["/api/crm/connections"],
  });

  // Get existing clients for selection
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Form setup
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      contactName: "",
      contactTitle: "",
      email: "",
      phone: "",
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      updateProposalData({
        clientId: newClient.id
      });
      toast({
        title: "Client saved",
        description: "Client information has been saved successfully.",
      });
      onNext(); // Move to next step
    },
    onError: (error) => {
      toast({
        title: "Error saving client",
        description: error.message || "Failed to save client information. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load CRM clients mutation
  const loadCrmClientsMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("GET", `/api/crm/${provider}/clients`, null);
      return response.json();
    },
    onSuccess: (crmClients) => {
      setCrmImportOpen(false);
      // Set the form values with the first client from CRM
      if (crmClients && crmClients.length > 0) {
        const client = crmClients[0];
        form.reset({
          companyName: client.companyName,
          industry: client.industry,
          address: client.address,
          city: client.city,
          state: client.state,
          postalCode: client.postalCode,
          contactName: client.contactName,
          contactTitle: client.contactTitle,
          email: client.email,
          phone: client.phone,
        });
        toast({
          title: "Client imported",
          description: `Client data for ${client.companyName} has been imported successfully.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error importing clients",
        description: error.message || "Failed to import clients from CRM. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Select existing client
  const handleSelectClient = (clientId: string) => {
    if (clientId === "new") {
      form.reset({
        companyName: "",
        industry: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        contactName: "",
        contactTitle: "",
        email: "",
        phone: "",
      });
      updateProposalData({
        clientId: 0
      });
    } else {
      const selectedClient = clients?.find(c => c.id.toString() === clientId);
      if (selectedClient) {
        form.reset({
          companyName: selectedClient.companyName,
          industry: selectedClient.industry || "",
          address: selectedClient.address || "",
          city: selectedClient.city || "",
          state: selectedClient.state || "",
          postalCode: selectedClient.postalCode || "",
          contactName: selectedClient.contactName || "",
          contactTitle: selectedClient.contactTitle || "",
          email: selectedClient.email || "",
          phone: selectedClient.phone || "",
        });
        updateProposalData({
          clientId: selectedClient.id
        });
      }
    }
  };

  // Import from CRM
  const handleImportFromCrm = (provider: string) => {
    if (connections?.connected) {
      loadCrmClientsMutation.mutate(provider);
    } else {
      toast({
        title: "CRM not connected",
        description: "Please connect to the CRM system first.",
        variant: "destructive",
      });
    }
  };

  // Form submission
  const onSubmit = (data: ClientFormValues) => {
    // If we've already selected an existing client, just proceed
    if (proposalData.clientId > 0) {
      onNext();
      return;
    }
    
    // Otherwise create a new client
    createClientMutation.mutate(data);
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
        Client Information
      </h3>
      
      {/* Client selection section */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select Existing Client
        </label>
        {isLoadingClients ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select 
            onValueChange={handleSelectClient}
            defaultValue="new"
          >
            <SelectTrigger>
              <SelectValue placeholder="Create new client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Create new client</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {/* CRM Integration */}
      <div className="mb-8 bg-neutral-50 p-4 rounded-md border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-neutral-900">Import client from CRM</h4>
            <p className="text-sm text-neutral-500">Select your CRM system to import client data</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleImportFromCrm("hubspot")}
              disabled={loadCrmClientsMutation.isPending}
            >
              <SiHubspot className="h-5 w-5 mr-2 text-[#ff5d2b]" />
              HubSpot
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleImportFromCrm("salesforce")}
              disabled={loadCrmClientsMutation.isPending}
            >
              <SiSalesforce className="h-5 w-5 mr-2 text-[#0176D3]" />
              Salesforce
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleImportFromCrm("pipedrive")}
              disabled={loadCrmClientsMutation.isPending}
            >
              <Database className="h-5 w-5 mr-2 text-[#00b289]" />
              Pipedrive
            </Button>
          </div>
        </div>
      </div>

      {/* Client form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Suite 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="94107" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="contactTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Procurement Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jane.smith@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting || createClientMutation.isPending}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Continue to Next Step
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClientInformation;
