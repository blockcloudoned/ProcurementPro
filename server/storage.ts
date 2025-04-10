import { 
  users, clients, templates, proposals,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Template, type InsertTemplate,
  type Proposal, type InsertProposal
} from "@shared/schema";

// Extended storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Template methods
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Proposal methods
  getProposal(id: number): Promise<Proposal | undefined>;
  getProposals(): Promise<Proposal[]>;
  getProposalsByClientId(clientId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined>;
  deleteProposal(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private templates: Map<number, Template>;
  private proposals: Map<number, Proposal>;
  
  private userId: number;
  private clientId: number;
  private templateId: number;
  private proposalId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.templates = new Map();
    this.proposals = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.templateId = 1;
    this.proposalId = 1;
    
    // Initialize with default templates
    this.initializeTemplates();
  }

  // Initialize default templates
  private initializeTemplates() {
    const professionalServices: InsertTemplate = {
      name: "Professional Services",
      description: "Ideal for consulting, IT services, and professional engagements",
      category: "Professional Services",
      content: {
        sections: [
          { title: "Executive Summary", content: "" },
          { title: "Scope of Services", content: "" },
          { title: "Delivery Timeline", content: "" },
          { title: "Pricing & Payment Terms", content: "" },
          { title: "Terms & Conditions", content: "" }
        ]
      },
      isDefault: true
    };
    
    const productSales: InsertTemplate = {
      name: "Product Sales",
      description: "Perfect for product offerings, equipment sales and supplies",
      category: "Product Sales",
      content: {
        sections: [
          { title: "Product Overview", content: "" },
          { title: "Features & Benefits", content: "" },
          { title: "Pricing & Quantity", content: "" },
          { title: "Delivery & Support", content: "" },
          { title: "Payment Terms", content: "" }
        ]
      },
      isDefault: true
    };
    
    const projectProposal: InsertTemplate = {
      name: "Project Proposal",
      description: "Structured for complex projects with milestones and deliverables",
      category: "Project Proposal",
      content: {
        sections: [
          { title: "Project Overview", content: "" },
          { title: "Objectives & Goals", content: "" },
          { title: "Methodology", content: "" },
          { title: "Timeline & Milestones", content: "" },
          { title: "Resource Allocation", content: "" },
          { title: "Budget Breakdown", content: "" },
          { title: "Success Criteria", content: "" }
        ]
      },
      isDefault: true
    };
    
    this.createTemplate(professionalServices);
    this.createTemplate(productSales);
    this.createTemplate(projectProposal);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const newClient: Client = { ...client, id };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = await this.getClient(id);
    if (!existingClient) return undefined;
    
    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Template methods
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.templateId++;
    const newTemplate: Template = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  // Proposal methods
  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async getProposals(): Promise<Proposal[]> {
    return Array.from(this.proposals.values());
  }

  async getProposalsByClientId(clientId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values())
      .filter(proposal => proposal.clientId === clientId);
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const id = this.proposalId++;
    const now = new Date();
    const newProposal: Proposal = {
      ...proposal,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.proposals.set(id, newProposal);
    return newProposal;
  }

  async updateProposal(id: number, proposal: Partial<InsertProposal>): Promise<Proposal | undefined> {
    const existingProposal = await this.getProposal(id);
    if (!existingProposal) return undefined;
    
    const updatedProposal: Proposal = {
      ...existingProposal,
      ...proposal,
      updatedAt: new Date()
    };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }

  async deleteProposal(id: number): Promise<boolean> {
    return this.proposals.delete(id);
  }
}

export const storage = new MemStorage();
