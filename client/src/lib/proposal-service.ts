import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export interface ProposalData {
  id?: number;
  title: string;
  clientId: number;
  templateId: number;
  status: string;
  amount: string;
  content: any;
}

export const ProposalService = {
  /**
   * Create a new proposal
   */
  createProposal: async (proposalData: Omit<ProposalData, 'id'>): Promise<ProposalData> => {
    const response = await apiRequest("POST", "/api/proposals", proposalData);
    const data = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
    return data;
  },

  /**
   * Get a proposal by ID
   */
  getProposal: async (id: number): Promise<ProposalData> => {
    const response = await apiRequest("GET", `/api/proposals/${id}`, null);
    return response.json();
  },

  /**
   * Get all proposals
   */
  getProposals: async (): Promise<ProposalData[]> => {
    const response = await apiRequest("GET", "/api/proposals", null);
    return response.json();
  },

  /**
   * Update an existing proposal
   */
  updateProposal: async (id: number, proposalData: Partial<ProposalData>): Promise<ProposalData> => {
    const response = await apiRequest("PUT", `/api/proposals/${id}`, proposalData);
    const data = await response.json();
    queryClient.invalidateQueries({ queryKey: [`/api/proposals/${id}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
    return data;
  },

  /**
   * Delete a proposal
   */
  deleteProposal: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/proposals/${id}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
  },

  /**
   * Change proposal status (draft, sent, approved, rejected)
   */
  updateProposalStatus: async (id: number, status: string): Promise<ProposalData> => {
    return ProposalService.updateProposal(id, { status });
  },

  /**
   * Get proposals by client ID
   */
  getProposalsByClient: async (clientId: number): Promise<ProposalData[]> => {
    const response = await apiRequest("GET", `/api/proposals?clientId=${clientId}`, null);
    return response.json();
  }
};

export default ProposalService;
