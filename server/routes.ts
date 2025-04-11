import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertProposalSchema, insertTemplateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const client = await storage.getClient(Number(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      
      // Track client creation activity for achievement badges
      // Using a default user id of 1 for now - in a real app this would be the logged-in user
      const userId = 1;
      await storage.trackUserActivity({
        userId,
        activityType: 'client_management',
        entityId: client.id,
        entityType: 'client',
        data: { clientId: client.id, companyName: client.companyName }
      });
      
      // Check if any badges were earned from this activity
      const earnedBadges = await storage.checkAchievements(userId, 'client_management');
      
      res.status(201).json({
        client,
        achievements: earnedBadges.length > 0 ? {
          badges: earnedBadges,
          message: 'Congratulations! You\'ve earned new achievement badges!'
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(id, validatedData);
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      let templates;
      
      if (category) {
        templates = await storage.getTemplatesByCategory(category);
      } else {
        templates = await storage.getTemplates();
      }
      
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    try {
      const template = await storage.getTemplate(Number(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Proposal routes
  app.get("/api/proposals", async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
      let proposals;
      
      if (clientId) {
        proposals = await storage.getProposalsByClientId(clientId);
      } else {
        proposals = await storage.getProposals();
      }
      
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get("/api/proposals/:id", async (req: Request, res: Response) => {
    try {
      const proposal = await storage.getProposal(Number(req.params.id));
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(proposal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  app.post("/api/proposals", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProposalSchema.parse(req.body);
      const proposal = await storage.createProposal(validatedData);
      
      // Track proposal creation activity for achievement badges
      // Using a default user id of 1 for now - in a real app this would be the logged-in user
      const userId = 1;
      await storage.trackUserActivity({
        userId,
        activityType: 'proposal_creation',
        entityId: proposal.id,
        entityType: 'proposal',
        data: { proposalId: proposal.id, title: proposal.title }
      });
      
      // If the proposal has an amount, track it for revenue achievements
      if (proposal.amount) {
        const amount = parseFloat(proposal.amount);
        if (!isNaN(amount) && amount > 0) {
          await storage.trackUserActivity({
            userId,
            activityType: 'revenue',
            entityId: proposal.id,
            entityType: 'proposal',
            data: { proposalId: proposal.id, amount }
          });
        }
      }
      
      // Check if any badges were earned from these activities
      const proposalBadges = await storage.checkAchievements(userId, 'proposal_creation');
      const revenueBadges = proposal.amount ? await storage.checkAchievements(userId, 'revenue') : [];
      
      // Combine all earned badges
      const earnedBadges = [...proposalBadges, ...revenueBadges];
      
      res.status(201).json({
        proposal,
        achievements: earnedBadges.length > 0 ? {
          badges: earnedBadges,
          message: 'Congratulations! You\'ve earned new achievement badges!'
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid proposal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.put("/api/proposals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertProposalSchema.partial().parse(req.body);
      const updatedProposal = await storage.updateProposal(id, validatedData);
      if (!updatedProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.json(updatedProposal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid proposal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  app.delete("/api/proposals/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteProposal(id);
      if (!success) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete proposal" });
    }
  });

  // CRM Integration mock endpoints
  app.get("/api/crm/connections", (req: Request, res: Response) => {
    res.json({
      connected: false,
      availableCRMs: [
        { id: "hubspot", name: "HubSpot", logo: "hubspot" },
        { id: "salesforce", name: "Salesforce", logo: "salesforce" },
        { id: "pipedrive", name: "Pipedrive", logo: "pipedrive" }
      ]
    });
  });

  app.post("/api/crm/connect/:provider", (req: Request, res: Response) => {
    const provider = req.params.provider;
    
    // Mock successful connection
    res.json({
      connected: true,
      provider: provider,
      message: `Successfully connected to ${provider}`
    });
  });

  app.get("/api/crm/:provider/clients", (req: Request, res: Response) => {
    const provider = req.params.provider;
    
    // Mock CRM client data
    const mockClients = [
      {
        crmId: "crm-1",
        companyName: "TechSolutions Inc.",
        industry: "Technology",
        address: "123 Tech Plaza",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        contactName: "John Smith",
        contactTitle: "CTO",
        email: "john@techsolutions.example",
        phone: "(555) 123-4567",
        crmSource: provider
      },
      {
        crmId: "crm-2",
        companyName: "Evergreen Healthcare",
        industry: "Healthcare",
        address: "456 Medical Drive",
        city: "Boston",
        state: "MA",
        postalCode: "02115",
        contactName: "Alice Johnson",
        contactTitle: "Procurement Director",
        email: "alice@evergreen.example",
        phone: "(555) 987-6543",
        crmSource: provider
      }
    ];
    
    res.json(mockClients);
  });

  // Document generation and export endpoints
  app.post("/api/proposals/:id/export", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const format = req.query.format || "pdf";
      const proposal = await storage.getProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      
      // In a real implementation, we would generate the document here
      // For now, we'll just return a success message
      res.json({
        success: true,
        format: format,
        message: `Proposal ${proposal.title} has been exported as ${format}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to export proposal" });
    }
  });
  
  // Achievement and badge endpoints
  app.get("/api/badges", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      let badges;
      
      if (category) {
        badges = await storage.getBadgesByCategory(category);
      } else {
        badges = await storage.getBadges();
      }
      
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });
  
  app.get("/api/badges/:id", async (req: Request, res: Response) => {
    try {
      const badge = await storage.getBadge(Number(req.params.id));
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      res.json(badge);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badge" });
    }
  });
  
  app.get("/api/users/:userId/achievements", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const achievements = await storage.getUserAchievementWithBadges(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });
  
  app.get("/api/users/:userId/activities", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
