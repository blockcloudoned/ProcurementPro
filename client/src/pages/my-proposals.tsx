import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, EyeIcon, PencilIcon } from "lucide-react";
import { ExportProposalButton } from "@/components/export-proposal-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MyProposals = () => {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data: proposals, isLoading } = useQuery({
    queryKey: ["/api/proposals"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/proposals/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Proposal deleted",
        description: "The proposal has been successfully deleted.",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting proposal",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteProposal = (id: number) => {
    deleteProposalMutation.mutate(id);
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client ? client.companyName : "Unknown Client";
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9 sm:truncate">
              My Proposals
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

        <Card>
          <CardHeader>
            <CardTitle>All Proposals</CardTitle>
            <CardDescription>
              Manage and track all your business proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : proposals?.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No proposals yet</h3>
                <p className="text-neutral-500 mb-6">Create your first business proposal to get started</p>
                <Link href="/create-proposal">
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create New Proposal
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals?.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.title}</TableCell>
                      <TableCell>{getClientName(proposal.clientId)}</TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell>{proposal.amount ? `$${proposal.amount}` : "-"}</TableCell>
                      <TableCell>{formatDate(proposal.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <EyeIcon className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <div className="px-2 py-1.5">
                                <ExportProposalButton 
                                  proposalId={proposal.id}
                                  proposalTitle={proposal.title}
                                  variant="ghost"
                                  size="sm"
                                />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => setDeleteId(proposal.id)}
                              className="text-red-600"
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected proposal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteId && handleDeleteProposal(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default MyProposals;
