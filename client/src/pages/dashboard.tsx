import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import RecentProposals from "@/components/recent-proposals";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  // Fetch proposals for dashboard stats
  const { data: proposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ["/api/proposals"],
  });

  // Fetch templates for quick access
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Calculate statistics
  const totalProposals = proposals?.length || 0;
  const draftProposals = proposals?.filter(p => p.status === "draft").length || 0;
  const sentProposals = proposals?.filter(p => p.status === "sent").length || 0;
  const approvedProposals = proposals?.filter(p => p.status === "approved").length || 0;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9 sm:truncate">
              Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/create-proposal">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Proposal
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Total Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingProposals ? "..." : totalProposals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingProposals ? "..." : draftProposals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingProposals ? "..." : sentProposals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isLoadingProposals ? "..." : approvedProposals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/create-proposal">
              <a className="p-6 bg-white shadow-sm rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-neutral-900">Create New Proposal</h4>
                    <p className="mt-1 text-sm text-neutral-500">Start building a professional business proposal</p>
                  </div>
                </div>
              </a>
            </Link>
            
            <Link href="/templates">
              <a className="p-6 bg-white shadow-sm rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-neutral-900">Browse Templates</h4>
                    <p className="mt-1 text-sm text-neutral-500">View and select from proposal templates</p>
                  </div>
                </div>
              </a>
            </Link>
            
            <Link href="/crm-integration">
              <a className="p-6 bg-white shadow-sm rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-neutral-900">Connect CRM</h4>
                    <p className="mt-1 text-sm text-neutral-500">Import client data from your CRM system</p>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        </div>

        {/* Recent proposals */}
        <RecentProposals />
      </div>
    </div>
  );
};

export default Dashboard;
