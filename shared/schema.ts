import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  clientId: integer("client_id").notNull(),
  templateId: integer("template_id").notNull(),
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
