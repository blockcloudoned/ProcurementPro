import { 
  users, clients, templates, proposals, badges, userAchievements, userActivities,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Template, type InsertTemplate,
  type Proposal, type InsertProposal,
  type Badge, type InsertBadge, 
  type UserAchievement, type InsertUserAchievement,
  type UserActivity, type InsertUserActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count } from "drizzle-orm";

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
  
  // Badge methods
  getBadge(id: number): Promise<Badge | undefined>;
  getBadges(): Promise<Badge[]>;
  getBadgesByCategory(category: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // User Achievement methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserAchievementWithBadges(userId: number): Promise<(UserAchievement & { badge: Badge })[]>;
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: number, achievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined>;
  
  // User Activity methods
  trackUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivities(userId: number): Promise<UserActivity[]>;
  checkAchievements(userId: number, activityType: string): Promise<Badge[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private templates: Map<number, Template>;
  private proposals: Map<number, Proposal>;
  private badges: Map<number, Badge>;
  private userAchievements: Map<number, UserAchievement>;
  private userActivities: Map<number, UserActivity>;
  
  private userId: number;
  private clientId: number;
  private templateId: number;
  private proposalId: number;
  private badgeId: number;
  private achievementId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.templates = new Map();
    this.proposals = new Map();
    this.badges = new Map();
    this.userAchievements = new Map();
    this.userActivities = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.templateId = 1;
    this.proposalId = 1;
    this.badgeId = 1;
    this.achievementId = 1;
    this.activityId = 1;
    
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
  
  // Badge methods
  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }

  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(badge => badge.category === category);
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.badgeId++;
    const now = new Date();
    const newBadge: Badge = { 
      ...badge, 
      id,
      createdAt: now
    };
    this.badges.set(id, newBadge);
    return newBadge;
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(achievement => achievement.userId === userId);
  }

  async getUserAchievementWithBadges(userId: number): Promise<(UserAchievement & { badge: Badge })[]> {
    const achievements = await this.getUserAchievements(userId);
    return achievements.map(achievement => {
      const badge = this.badges.get(achievement.badgeId);
      if (!badge) throw new Error(`Badge with id ${achievement.badgeId} not found`);
      return {
        ...achievement,
        badge
      };
    });
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.achievementId++;
    const now = new Date();
    const newAchievement: UserAchievement = {
      ...achievement,
      id,
      earnedAt: now
    };
    this.userAchievements.set(id, newAchievement);
    return newAchievement;
  }

  async updateUserAchievement(id: number, achievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined> {
    const existingAchievement = this.userAchievements.get(id);
    if (!existingAchievement) return undefined;

    const updatedAchievement: UserAchievement = {
      ...existingAchievement,
      ...achievement
    };
    this.userAchievements.set(id, updatedAchievement);
    return updatedAchievement;
  }

  // User Activity methods
  async trackUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const id = this.activityId++;
    const now = new Date();
    const newActivity: UserActivity = {
      ...activity,
      id,
      createdAt: now
    };
    this.userActivities.set(id, newActivity);
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return Array.from(this.userActivities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Check if a user's activity triggers any achievements and return any earned badges
  async checkAchievements(userId: number, activityType: string): Promise<Badge[]> {
    const earnedBadges: Badge[] = [];
    
    // Get all badges that could be triggered by this activity type
    const activityBadges = await this.getBadgesByCategory(activityType);
    
    if (activityBadges.length === 0) return earnedBadges;
    
    // Count user activities by type
    const activities = (await this.getUserActivities(userId))
      .filter(activity => activity.activityType === activityType);
    
    const activityCount = activities.length;
    
    // Get user's current achievements
    const userAchievements = await this.getUserAchievements(userId);
    const achievedBadgeIds = new Set(userAchievements.map(a => a.badgeId));
    
    // Check each badge to see if it's newly earned
    for (const badge of activityBadges) {
      if (!achievedBadgeIds.has(badge.id) && activityCount >= badge.requiredCount) {
        // User has earned this badge
        await this.createUserAchievement({
          userId,
          badgeId: badge.id,
          count: activityCount,
          progress: activityCount
        });
        
        earnedBadges.push(badge);
      } else if (achievedBadgeIds.has(badge.id)) {
        // User already has this badge, update the progress
        const achievement = userAchievements.find(a => a.badgeId === badge.id);
        if (achievement) {
          await this.updateUserAchievement(achievement.id, {
            count: activityCount,
            progress: activityCount
          });
        }
      }
    }
    
    return earnedBadges;
  }
}

// Database-based storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(client: InsertClient): Promise<Client> {
    // Ensure all nullable fields are explicitly set to null if undefined
    const clientWithNulls = {
      ...client,
      industry: client.industry || null,
      address: client.address || null,
      city: client.city || null,
      state: client.state || null,
      postalCode: client.postalCode || null,
      contactName: client.contactName || null,
      contactTitle: client.contactTitle || null,
      email: client.email || null,
      phone: client.phone || null,
      crmSource: client.crmSource || null,
      crmId: client.crmId || null
    };
    
    const [newClient] = await db.insert(clients).values(clientWithNulls).returning();
    return newClient;
  }

  async updateClient(
    id: number,
    client: Partial<InsertClient>
  ): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return !!result.rowCount && result.rowCount > 0;
  }

  // Template methods
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.category, category));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    // Ensure all nullable fields are explicitly set to null if undefined
    const templateWithNulls = {
      ...template,
      description: template.description || null,
      isDefault: template.isDefault ?? false
    };
    
    const [newTemplate] = await db.insert(templates).values(templateWithNulls).returning();
    return newTemplate;
  }

  // Proposal methods
  async getProposal(id: number): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal || undefined;
  }

  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }

  async getProposalsByClientId(clientId: number): Promise<Proposal[]> {
    return await db.select().from(proposals).where(eq(proposals.clientId, clientId));
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    // Ensure all required fields are set and nullable fields are explicitly set to null if undefined
    const proposalWithNulls = {
      ...proposal,
      status: proposal.status || 'draft',
      content: proposal.content || {},
      amount: proposal.amount || null
    };
    
    const [newProposal] = await db.insert(proposals).values(proposalWithNulls).returning();
    return newProposal;
  }

  async updateProposal(
    id: number,
    proposal: Partial<InsertProposal>
  ): Promise<Proposal | undefined> {
    const [updatedProposal] = await db
      .update(proposals)
      .set({
        ...proposal,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();
    return updatedProposal || undefined;
  }

  async deleteProposal(id: number): Promise<boolean> {
    const result = await db.delete(proposals).where(eq(proposals.id, id));
    return !!result.rowCount && result.rowCount > 0;
  }

  // Badge methods
  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge || undefined;
  }

  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.category, category));
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async getUserAchievementWithBadges(userId: number): Promise<(UserAchievement & { badge: Badge })[]> {
    const results = await db.select({
      achievement: userAchievements,
      badge: badges
    })
    .from(userAchievements)
    .innerJoin(badges, eq(userAchievements.badgeId, badges.id))
    .where(eq(userAchievements.userId, userId));
    
    return results.map(r => ({
      ...r.achievement,
      badge: r.badge
    }));
  }

  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(userAchievements).values(achievement).returning();
    return newAchievement;
  }

  async updateUserAchievement(id: number, achievement: Partial<InsertUserAchievement>): Promise<UserAchievement | undefined> {
    const [updatedAchievement] = await db
      .update(userAchievements)
      .set(achievement)
      .where(eq(userAchievements.id, id))
      .returning();
    return updatedAchievement || undefined;
  }

  // User Activity methods
  async trackUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db.insert(userActivities).values(activity).returning();
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return await db.select().from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(userActivities.createdAt);
  }

  // Check if a user's activity triggers any achievements and return any earned badges
  async checkAchievements(userId: number, activityType: string): Promise<Badge[]> {
    const earnedBadges: Badge[] = [];
    
    // Get all badges that could be triggered by this activity type
    const activityBadges = await this.getBadgesByCategory(activityType);
    
    if (activityBadges.length === 0) return earnedBadges;
    
    // Count user activities by type
    const activities = await db.select({ count: count() })
      .from(userActivities)
      .where(and(
        eq(userActivities.userId, userId),
        eq(userActivities.activityType, activityType)
      ));
    
    const activityCount = activities[0]?.count || 0;
    
    // Get user's current achievements
    const userAchievements = await this.getUserAchievements(userId);
    const achievedBadgeIds = new Set(userAchievements.map(a => a.badgeId));
    
    // Check each badge to see if it's newly earned
    for (const badge of activityBadges) {
      if (!achievedBadgeIds.has(badge.id) && activityCount >= badge.requiredCount) {
        // User has earned this badge
        await this.createUserAchievement({
          userId,
          badgeId: badge.id,
          count: activityCount,
          progress: activityCount
        });
        
        earnedBadges.push(badge);
      } else if (achievedBadgeIds.has(badge.id)) {
        // User already has this badge, update the progress
        const achievement = userAchievements.find(a => a.badgeId === badge.id);
        if (achievement) {
          await this.updateUserAchievement(achievement.id, {
            count: activityCount,
            progress: activityCount
          });
        }
      }
    }
    
    return earnedBadges;
  }

  // Initialize default badges if they don't exist
  async initializeBadges(): Promise<void> {
    const existingBadges = await this.getBadges();
    
    if (existingBadges.length === 0) {
      const defaultBadges = [
        {
          name: "Proposal Novice",
          description: "Created your first proposal",
          icon: "award",
          category: "proposal_creation",
          requiredCount: 1
        },
        {
          name: "Proposal Expert",
          description: "Created 5 proposals",
          icon: "trophy",
          category: "proposal_creation",
          requiredCount: 5
        },
        {
          name: "Proposal Master",
          description: "Created 10 proposals",
          icon: "star",
          category: "proposal_creation",
          requiredCount: 10
        },
        {
          name: "Client Connector",
          description: "Added your first client",
          icon: "users",
          category: "client_management",
          requiredCount: 1
        },
        {
          name: "Network Builder",
          description: "Added 5 clients",
          icon: "network",
          category: "client_management",
          requiredCount: 5
        },
        {
          name: "Revenue Generator",
          description: "Proposals worth $10,000 in total",
          icon: "dollar-sign",
          category: "revenue",
          requiredCount: 1
        },
        {
          name: "Deal Closer",
          description: "First proposal approved by client",
          icon: "check-circle",
          category: "proposal_approved",
          requiredCount: 1
        }
      ];

      for (const badge of defaultBadges) {
        await this.createBadge(badge);
      }
    }
  }

  // Initialize default templates if they don't exist
  async initializeTemplates(): Promise<void> {
    const existingTemplates = await this.getTemplates();
    
    if (existingTemplates.length === 0) {
      const defaultTemplates = [
        {
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
        },
        {
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
        },
        {
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
        }
      ];

      for (const template of defaultTemplates) {
        await this.createTemplate(template);
      }
    }
  }
}

// Create and export the database storage instance
export const storage = new DatabaseStorage();
