import React, { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, 
  PencilIcon, 
  SendIcon, 
  ArchiveIcon, 
  ClockIcon, 
  BuildingIcon,
  DollarSign,
  CalendarIcon,
  FileTextIcon,
  History,
  BarChart,
  MessageSquare
} from 'lucide-react';
import { ExportProposalButton } from '@/components/export-proposal-button';
import { ProposalVersionTimeline, Version } from '@/components/proposal-version-timeline';
import { SmartProposalEditor } from '@/components/smart-proposal-editor';

// Example version history data
const mockVersionHistory: Version[] = [
  {
    id: 3,
    proposalId: 1,
    versionNumber: 3,
    createdBy: 'John Smith',
    createdAt: new Date().toISOString(),
    changes: [
      { type: 'modified', section: 'Executive Summary' },
      { type: 'modified', section: 'Pricing Details' }
    ],
    comment: 'Updated pricing structure based on client feedback',
    status: 'draft'
  },
  {
    id: 2,
    proposalId: 1,
    versionNumber: 2,
    createdBy: 'John Smith',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    changes: [
      { type: 'added', section: 'Deliverables' },
      { type: 'modified', section: 'Timeline' }
    ],
    comment: 'Added detailed deliverables section',
    status: 'sent'
  },
  {
    id: 1,
    proposalId: 1,
    versionNumber: 1,
    createdBy: 'John Smith',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    changes: [],
    status: 'draft'
  }
];

const ProposalDetails = () => {
  const [, params] = useRoute('/proposal/:id');
  const proposalId = params?.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentVersionId, setCurrentVersionId] = useState<number | undefined>(mockVersionHistory[0]?.id);

  // Types for better typing
  interface Proposal {
    id: number;
    title: string;
    clientId: number;
    templateId: number;
    status: string;
    amount?: number;
    content: Record<string, string>;
    createdAt: string;
    updatedAt: string;
  }

  interface Client {
    id: number;
    companyName: string;
    contactName: string;
    contactTitle: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    industry: string;
  }

  // Fetch proposal data
  const { data: proposal, isLoading: isLoadingProposal } = useQuery<Proposal>({
    queryKey: [`/api/proposals/${proposalId}`],
    enabled: !!proposalId,
  });

  // Fetch client data if we have a clientId
  const { data: client, isLoading: isLoadingClient } = useQuery<Client>({
    queryKey: [`/api/clients/${proposal?.clientId}`],
    enabled: !!proposal?.clientId,
  });

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle version selection
  const handleSelectVersion = (versionId: number) => {
    setCurrentVersionId(versionId);
    toast({
      title: 'Version selected',
      description: `Viewing version ${mockVersionHistory.find(v => v.id === versionId)?.versionNumber || ''}`,
    });
  };

  // Handle version comparison
  const handleCompareVersions = (fromVersionId: number, toVersionId: number) => {
    const fromVersion = mockVersionHistory.find(v => v.id === fromVersionId);
    const toVersion = mockVersionHistory.find(v => v.id === toVersionId);
    
    if (fromVersion && toVersion) {
      console.log(`Comparing version ${fromVersion.versionNumber} with version ${toVersion.versionNumber}`);
    }
  };

  // Handle version restoration
  const handleRestoreVersion = (versionId: number) => {
    const version = mockVersionHistory.find(v => v.id === versionId);
    
    if (version) {
      console.log(`Restoring version ${version.versionNumber}`);
      toast({
        title: 'Version restored',
        description: `Version ${version.versionNumber} has been restored as a new version`,
      });
    }
  };

  const isLoading = isLoadingProposal || isLoadingClient;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/my-proposals')}
              className="hover:bg-transparent hover:text-primary-600 -ml-3"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Proposals
            </Button>
          </div>

          {isLoading ? (
            <>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2 mt-2" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:leading-9">
                  {proposal?.title || 'Proposal Details'}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <ExportProposalButton
                    proposalId={proposalId}
                    proposalTitle={proposal?.title}
                    size="sm"
                  />
                  <Button variant="outline" size="sm">
                    <SendIcon className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                  {proposal?.status?.toUpperCase() || 'DRAFT'}
                </Badge>
                <span className="text-neutral-500 flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Last updated: {formatDate(proposal?.updatedAt)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Tabs navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">
              <FileTextIcon className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="versionHistory">
              <History className="h-4 w-4 mr-2" />
              Version History
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="comments" disabled>
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab content */}
        <div className="space-y-6">
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Details */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Proposal Details</CardTitle>
                    <CardDescription>
                      Complete proposal information and content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Read-only smart proposal editor */}
                        <SmartProposalEditor
                          initialValues={proposal?.content || {}}
                          readOnly={true}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Metadata */}
              <div className="space-y-6">
                {/* Client card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <BuildingIcon className="h-5 w-5 text-neutral-400 mr-2 mt-0.5" />
                          <div>
                            <div className="font-medium">{client?.companyName}</div>
                            <div className="text-sm text-neutral-500">{client?.industry}</div>
                            <div className="text-sm text-neutral-500">
                              {client?.address}, {client?.city}, {client?.state} {client?.postalCode}
                            </div>
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <div className="font-medium">{client?.contactName}</div>
                          <div className="text-sm text-neutral-500">{client?.contactTitle}</div>
                          <div className="text-sm text-neutral-500">{client?.email}</div>
                          <div className="text-sm text-neutral-500">{client?.phone}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Proposal metadata card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Proposal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 text-neutral-400 mr-2" />
                            <span className="text-neutral-500">Amount:</span>
                          </div>
                          <div className="font-medium">
                            {proposal?.amount ? `$${proposal.amount}` : 'Not specified'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 text-neutral-400 mr-2" />
                            <span className="text-neutral-500">Created on:</span>
                          </div>
                          <div className="font-medium">
                            {formatDate(proposal?.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <History className="h-4 w-4 text-neutral-400 mr-2" />
                            <span className="text-neutral-500">Current version:</span>
                          </div>
                          <div className="font-medium">
                            {mockVersionHistory[0]?.versionNumber || 1}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Version History tab */}
          {activeTab === 'versionHistory' && (
            <ProposalVersionTimeline
              versions={mockVersionHistory}
              currentVersionId={currentVersionId}
              onSelectVersion={handleSelectVersion}
              onCompareVersions={handleCompareVersions}
              onRestoreVersion={handleRestoreVersion}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;