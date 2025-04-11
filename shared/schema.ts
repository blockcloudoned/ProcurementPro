import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Client model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  contactName: text("contact_name"),
  contactTitle: text("contact_title"),
  email: text("email"),
  phone: text("phone"),
  crmSource: text("crm_source"), // e.g., 'hubspot', 'salesforce', 'pipedrive'
  crmId: text("crm_id"), // ID from the CRM system
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

// Template model
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // e.g., 'Professional Services', 'Product Sales', 'Project Proposal'
  content: jsonb("content").notNull(), // Stores the template structure/content as JSON
  isDefault: boolean("is_default").default(false),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

// Proposal model
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  templateId: integer("template_id").notNull().references(() => templates.id),
  status: text("status").notNull().default("draft"), // 'draft', 'sent', 'approved', 'rejected'
  amount: text("amount"),
  content: jsonb("content"), // Stores the proposal content as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define types for use throughout the application
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

// Extend the proposal schema with additional validation for forms
export const proposalFormSchema = insertProposalSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  amount: z.string().optional(),
  clientId: z.number().positive("Client must be selected"),
  templateId: z.number().positive("Template must be selected"),
});

// Users model (for authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Relations definitions
export const clientRelations = relations(clients, ({ many }) => ({
  proposals: many(proposals),
}));

export const templateRelations = relations(templates, ({ many }) => ({
  proposals: many(proposals),
}));

export const proposalRelations = relations(proposals, ({ one }) => ({
  client: one(clients, {
    fields: [proposals.clientId],
    references: [clients.id],
  }),
  template: one(templates, {
    fields: [proposals.templateId],
    references: [templates.id],
  }),
}));

// Badge model
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Font awesome or other icon identifier
  category: text("category").notNull(), // e.g., 'proposal_creation', 'client_management', 'revenue'
  requiredCount: integer("required_count").notNull().default(1), // Required count to earn the badge
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

// User achievement model
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  count: integer("count").notNull().default(1), // Number of times achievement criteria was met
  progress: integer("progress").notNull().default(0), // Progress towards next level/badge
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// User activity model to track actions for achievements
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(), // e.g., 'proposal_created', 'proposal_sent', 'client_added'
  entityId: integer("entity_id"), // ID of related entity (proposal, client, etc.)
  entityType: text("entity_type"), // Type of related entity ('proposal', 'client', etc.)
  data: jsonb("data"), // Additional data about the activity
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  createdAt: true,
});

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

// Relations for users and achievements
export const userRelations = relations(users, ({ many }) => ({
  achievements: many(userAchievements),
  activities: many(userActivities),
}));

export const badgeRelations = relations(badges, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userAchievements.badgeId],
    references: [badges.id],
  }),
}));

export const userActivityRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));
