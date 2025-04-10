import { apiRequest } from "@/lib/queryClient";

export type ExportFormat = 'pdf' | 'docx';

export interface ExportResult {
  success: boolean;
  format: string;
  message: string;
  downloadUrl?: string;
}

export const DocumentService = {
  /**
   * Export a proposal as a document
   */
  exportProposal: async (proposalId: number, format: ExportFormat): Promise<ExportResult> => {
    try {
      const response = await apiRequest("POST", `/api/proposals/${proposalId}/export?format=${format}`, null);
      return response.json();
    } catch (error) {
      console.error("Export error:", error);
      return {
        success: false,
        format,
        message: error instanceof Error ? error.message : "Export failed"
      };
    }
  },

  /**
   * Generate a preview of the proposal
   */
  generatePreview: async (proposalId: number): Promise<string> => {
    // In a real implementation, this might return HTML content or a URL to a preview
    // For now, we'll just return a mock success message
    return `Preview generated for proposal ${proposalId}`;
  },

  /**
   * Send a proposal to a client via email
   */
  sendProposalByEmail: async (proposalId: number, email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(
        "POST", 
        `/api/proposals/${proposalId}/send`, 
        { email }
      );
      return response.json();
    } catch (error) {
      console.error("Send error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send proposal"
      };
    }
  },

  /**
   * Get supported export formats
   */
  getSupportedFormats: (): ExportFormat[] => {
    return ['pdf', 'docx'];
  }
};

export default DocumentService;
