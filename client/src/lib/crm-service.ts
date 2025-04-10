import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export interface CrmConnection {
  connected: boolean;
  provider?: string;
  availableCRMs: Array<{
    id: string;
    name: string;
    logo: string;
  }>;
}

export interface CrmClient {
  crmId: string;
  companyName: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  contactName?: string;
  contactTitle?: string;
  email?: string;
  phone?: string;
  crmSource: string;
}

export const CrmService = {
  /**
   * Get CRM connection status
   */
  getConnections: async (): Promise<CrmConnection> => {
    const response = await apiRequest("GET", "/api/crm/connections", null);
    return response.json();
  },

  /**
   * Connect to a CRM provider
   */
  connectToCrm: async (provider: string): Promise<{ connected: boolean; provider: string; message: string }> => {
    const response = await apiRequest("POST", `/api/crm/connect/${provider}`, null);
    const data = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/crm/connections"] });
    return data;
  },

  /**
   * Get clients from connected CRM
   */
  getClientsFromCrm: async (provider: string): Promise<CrmClient[]> => {
    const response = await apiRequest("GET", `/api/crm/${provider}/clients`, null);
    return response.json();
  },

  /**
   * Import a client from CRM to the system
   */
  importClientFromCrm: async (client: CrmClient): Promise<any> => {
    const clientData = {
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
      crmSource: client.crmSource,
      crmId: client.crmId,
    };
    
    const response = await apiRequest("POST", "/api/clients", clientData);
    const data = await response.json();
    queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    return data;
  },

  /**
   * Disconnect from CRM
   */
  disconnectFromCrm: async (provider: string): Promise<void> => {
    await apiRequest("DELETE", `/api/crm/connect/${provider}`, null);
    queryClient.invalidateQueries({ queryKey: ["/api/crm/connections"] });
  }
};

export default CrmService;
