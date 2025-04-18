import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrendingUp, AlertCircle, Download } from "lucide-react";
import RecentProposals from "@/components/recent-proposals";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface Proposal {
  id: number;
  title: string;
  clientId: number;
  templateId: number;
  status: string;
  amount: string;
  content: any;
  createdAt?: string;
  updatedAt?: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  content: any;
  isDefault: boolean;
}

const Dashboard = () => {
  // Fetch proposals for dashboard stats
  const { data: proposals, isLoading: isLoadingProposals } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  // Fetch templates for quick access
  const { data: templates, isLoading: isLoadingTemplates } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Calculate statistics
  const totalProposals = proposals ? proposals.length : 0;
  const draftProposals = proposals ? proposals.filter((p: Proposal) => p.status === "draft").length : 0;
  const sentProposals = proposals ? proposals.filter((p: Proposal) => p.status === "sent").length : 0;
  const approvedProposals = proposals ? proposals.filter((p: Proposal) => p.status === "approved").length : 0;
  const rejectedProposals = proposals ? proposals.filter((p: Proposal) => p.status === "rejected").length : 0;
  
  // Chart data
  const statusData = [
    { name: "Draft", value: draftProposals, color: "#FFB547" },
    { name: "Sent", value: sentProposals, color: "#3B82F6" },
    { name: "Approved", value: approvedProposals, color: "#10B981" },
    { name: "Rejected", value: rejectedProposals, color: "#EF4444" }
  ].filter(item => item.value > 0);
  
  // Monthly proposal data (simplified mock data for now)
  const currentMonth = new Date().getMonth();
  const monthlyData = [
    { name: "Jan", proposals: 0 },
    { name: "Feb", proposals: 0 },
    { name: "Mar", proposals: 0 },
    { name: "Apr", proposals: 0 },
    { name: "May", proposals: 0 },
    { name: "Jun", proposals: 0 },
    { name: "Jul", proposals: 0 },
    { name: "Aug", proposals: 0 },
    { name: "Sep", proposals: 0 },
    { name: "Oct", proposals: 0 },
    { name: "Nov", proposals: 0 },
    { name: "Dec", proposals: 0 }
  ];
  
  // Populate with actual data based on created dates
  if (proposals && proposals.length > 0) {
    proposals.forEach((proposal: Proposal) => {
      const creationDate = new Date(proposal.createdAt || new Date());
      const month = creationDate.getMonth();
      monthlyData[month].proposals += 1;
    });
  }

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
              <div className="p-6 bg-white shadow-sm rounded-lg border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
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
              </div>
            </Link>
            
            <Link href="/templates">
              <div className="p-6 bg-white shadow-sm rounded-lg border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
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
              </div>
            </Link>
            
            <Link href="/crm-integration">
              <div className="p-6 bg-white shadow-sm rounded-lg border border-neutral-200 hover:shadow-md transition-shadow cursor-pointer">
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
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Analytics</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Proposal status distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of proposals by their current status
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {statusData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} proposals`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertCircle className="h-12 w-12 text-neutral-300 mb-2" />
                    <p className="text-neutral-500">No proposal data available</p>
                    <p className="text-sm text-neutral-400">Create proposals to view analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly proposals */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Proposals</CardTitle>
                <CardDescription>
                  Number of proposals created each month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value} proposals`, 'Count']} />
                      <Bar dataKey="proposals" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-xs text-neutral-500">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  <span>Data based on proposal creation dates</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Recent proposals */}
        <RecentProposals />
      </div>
    </div>
  );
};

export default Dashboard;
