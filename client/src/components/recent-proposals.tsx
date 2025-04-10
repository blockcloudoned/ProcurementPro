import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, DollarSign } from "lucide-react";

const RecentProposals = () => {
  const { data: proposals, isLoading } = useQuery({
    queryKey: ["/api/proposals"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.companyName : "Unknown Client";
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Draft</Badge>;
      case "sent":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Sent</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get template type
  const getProposalType = (templateId: number) => {
    // This would be better with template data, but we'll use a simple mapping for now
    switch (templateId) {
      case 1:
        return "Professional Services";
      case 2:
        return "Product Sales";
      case 3:
        return "Project Proposal";
      default:
        return "Custom Proposal";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="mt-10">
        <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
          Recent Proposals
        </h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-neutral-200">
            {[1, 2, 3].map((i) => (
              <li key={i} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="mt-2 h-4 w-32 sm:mt-0" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Sort proposals by updated date, newest first
  const sortedProposals = [...(proposals || [])].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Take only the first 3 proposals
  const recentProposals = sortedProposals.slice(0, 3);

  if (recentProposals.length === 0) {
    return (
      <div className="mt-10">
        <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
          Recent Proposals
        </h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-neutral-500">No proposals created yet.</p>
          <Link href="/create-proposal">
            <a className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-700">
              Create your first proposal
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
        Recent Proposals
      </h3>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-neutral-200">
          {recentProposals.map((proposal) => (
            <li key={proposal.id}>
              <Link href={`/proposals/${proposal.id}`}>
                <a className="block hover:bg-neutral-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {proposal.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(proposal.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-neutral-500">
                          <FileText className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                          {getProposalType(proposal.templateId)}
                        </p>
                        {proposal.amount && (
                          <p className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0 sm:ml-6">
                            <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                            ${proposal.amount}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-neutral-400" />
                        <p>
                          Updated on <time dateTime={proposal.updatedAt}>{formatDate(proposal.updatedAt)}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentProposals;
