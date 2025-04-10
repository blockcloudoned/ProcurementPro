import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import CrmConnector from "@/components/crm-connector";
import { SiHubspot, SiSalesforce } from "react-icons/si";
import { Database } from "lucide-react";
import { CheckCircle, AlertCircle } from "lucide-react";

const CrmIntegration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("connect");
  
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["/api/crm/connections"],
  });

  const crmConnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("POST", `/api/crm/connect/${provider}`, null);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/connections"] });
      toast({
        title: "CRM Connected",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to the CRM system. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleConnect = (provider: string) => {
    crmConnectMutation.mutate(provider);
  };

  const getCrmIcon = (provider: string) => {
    switch (provider) {
      case "hubspot":
        return <SiHubspot className="h-5 w-5 mr-2 text-[#ff5d2b]" />;
      case "salesforce":
        return <SiSalesforce className="h-5 w-5 mr-2 text-[#0176D3]" />;
      case "pipedrive":
        return <Database className="h-5 w-5 mr-2 text-[#00b289]" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9 sm:truncate">
              CRM Integration
            </h2>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="connect">Connect CRM</TabsTrigger>
            <TabsTrigger value="import">Import Clients</TabsTrigger>
            <TabsTrigger value="settings">Integration Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Connect to a CRM</CardTitle>
                <CardDescription>
                  Select your CRM system to import client data for your proposals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingConnections ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {connections?.availableCRMs.map((crm: any) => (
                      <CrmConnector
                        key={crm.id}
                        name={crm.name}
                        icon={getCrmIcon(crm.id)}
                        isConnected={connections.connected && connections.provider === crm.id}
                        onConnect={() => handleConnect(crm.id)}
                        isPending={crmConnectMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <p className="text-sm text-neutral-500 mb-4">
                  Connecting your CRM allows you to import client information directly into your proposals, 
                  saving time and ensuring accuracy in your business communications.
                </p>
                <div className="flex items-center text-sm text-primary-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>All data transfers are secure and encrypted</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Clients from CRM</CardTitle>
                <CardDescription>
                  Select clients from your connected CRM to import
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!connections?.connected ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">No CRM Connected</h3>
                      <p className="mt-1 text-sm text-amber-700">
                        Please connect to a CRM system first to import client data.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setActiveTab("connect")}
                      >
                        Go to Connect CRM
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">Import Clients</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Your CRM is connected. You can now import clients when creating a proposal.
                    </p>
                    <div className="mt-6">
                      <Button>Import Clients Now</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
                <CardDescription>
                  Manage your CRM integration settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium">Sync Frequency</h4>
                      <p className="text-sm text-neutral-500">How often to synchronize data with your CRM</p>
                    </div>
                    <select className="block w-40 rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                      <option>Manual</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h4 className="text-sm font-medium">Data to Import</h4>
                      <p className="text-sm text-neutral-500">Select what data to import from your CRM</p>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-neutral-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-sm text-neutral-700">Client information</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-neutral-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-sm text-neutral-700">Contact details</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-neutral-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-sm text-neutral-700">Deal/opportunity info</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h4 className="text-sm font-medium">Send Proposals to CRM</h4>
                      <p className="text-sm text-neutral-500">Automatically sync proposals back to your CRM</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CrmIntegration;
