
import { mysqlTable, text, int, boolean, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const session = mysqlTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Users & Auth
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"), // "admin", "manager", "employee"
  permissions: json("permissions").default(sql`(JSON_ARRAY())`), // Array of permission strings
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  nameEn: text("name_en"),
  department: text("department"),
  employeeId: text("employee_id"),
  lastLogin: timestamp("last_login").default(sql`NULL`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InferSelectModel<typeof users>;

// Client Users (for customer portal)
export const clientUsers = mysqlTable("client_users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  clientId: text("client_id").notNull(), // References clients.id
  clientName: text("client_name").notNull(),
  clientNameEn: text("client_name_en"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login").default(sql`NULL`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientUserSchema = createInsertSchema(clientUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export type InsertClientUser = z.infer<typeof insertClientUserSchema>;
export type ClientUser = InferSelectModel<typeof clientUsers>;

// Invitations (for new users)
export const invitations = mysqlTable("invitations", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: text("email").notNull(),
  role: text("role").notNull().default("employee"),
  permissions: json("permissions").default(sql`(JSON_ARRAY())`),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "expired"
  name: text("name"),
  nameEn: text("name_en"),
  department: text("department"),
  employeeId: text("employee_id"),
  usedAt: timestamp("used_at").default(sql`NULL`),
  invitedBy: text("invited_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = InferSelectModel<typeof invitations>;

// Permissions
export const PermissionEnum = z.enum([
  "view_clients", "edit_clients", "archive_clients",
  "view_leads", "edit_leads",
  "create_packages", "edit_packages",
  "view_invoices", "create_invoices", "edit_invoices",
  "view_goals", "edit_goals",
  "view_finance", "edit_finance",
  "view_employees", "edit_employees",
  "assign_employees", "edit_work_tracking"
]);

export type Permission = z.infer<typeof PermissionEnum>;

// Password reset tokens
export const passwordResets = mysqlTable("password_resets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at").default(sql`NULL`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetSchema = createInsertSchema(passwordResets).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export type InsertPasswordReset = z.infer<typeof insertPasswordResetSchema>;
export type PasswordReset = InferSelectModel<typeof passwordResets>;

export const goalTypeConfigs: Record<GoalType, { labelAr: string; labelEn: string; isPercentage: boolean; hasCurrency: boolean; hasCountry: boolean; defaultIcon: string }> = {
  financial: { labelAr: "مالي", labelEn: "Financial", isPercentage: false, hasCurrency: true, hasCountry: true, defaultIcon: "DollarSign" },
  clients: { labelAr: "عملاء", labelEn: "Clients", isPercentage: false, hasCurrency: false, hasCountry: true, defaultIcon: "Users" },
  leads: { labelAr: "عملاء محتملون", labelEn: "Leads", isPercentage: false, hasCurrency: false, hasCountry: true, defaultIcon: "Target" },
  projects: { labelAr: "مشاريع", labelEn: "Projects", isPercentage: false, hasCurrency: false, hasCountry: true, defaultIcon: "Folder" },
  performance: { labelAr: "أداء", labelEn: "Performance", isPercentage: true, hasCurrency: false, hasCountry: false, defaultIcon: "TrendingUp" },
  custom: { labelAr: "مخصص", labelEn: "Custom", isPercentage: false, hasCurrency: false, hasCountry: false, defaultIcon: "Star" },
};

// Goal Types
export const GoalTypeEnum = z.enum([
  "financial",
  "clients",
  "leads",
  "projects",
  "performance",
  "custom"
]);

export type GoalType = z.infer<typeof GoalTypeEnum>;

// Currency Types - Extended for Finance
export const CurrencyEnum = z.enum(["TRY", "USD", "EUR", "SAR", "EGP", "AED"]);
export type Currency = z.infer<typeof CurrencyEnum>;

// Transaction Types
export const TransactionTypeEnum = z.enum(["income", "expense"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

// Expense Categories
export const ExpenseCategoryEnum = z.enum([
  "salaries",
  "ads",
  "tools",
  "subscriptions",
  "refunds",
  "rent",
  "utilities",
  "office_supplies",
  "maintenance",
  "legal",
  "taxes",
  "other"
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategoryEnum>;

// Leads (CRM)
export const leads = mysqlTable("leads", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  country: text("country"),
  source: text("source"),
  stage: text("stage").notNull().default("new"), // "new", "contacted", "proposal_sent", "negotiation", "won", "lost"
  dealValue: int("deal_value"),
  dealCurrency: text("deal_currency"),
  notes: text("notes"),
  negotiatorId: text("negotiator_id"), // Employee handling the lead
  wasConfirmedClient: boolean("was_confirmed_client").default(false),
  convertedFromClientId: text("converted_from_client_id"),
  preservedClientData: json("preserved_client_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = InferSelectModel<typeof leads>;

// Clients
export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  country: text("country"),
  source: text("source"),
  status: text("status").notNull().default("active"), // "active", "inactive"
  salesOwnerId: text("sales_owner_id"), // Main sales person
  assignedManagerId: text("assigned_manager_id"), // Account manager
  convertedFromLeadId: text("converted_from_lead_id"), // Lead ID if converted
  leadCreatedAt: timestamp("lead_created_at").default(sql`NULL`), // Original lead creation date (for sales stats)
  salesOwners: json("sales_owners").default(sql`(JSON_ARRAY())`), // Array of IDs
  assignedStaff: json("assigned_staff").default(sql`(JSON_ARRAY())`), // Array of IDs
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = InferSelectModel<typeof clients>;

// Client Services (Active Projects)
export const clientServices = mysqlTable("client_services", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  clientId: text("client_id").notNull(),
  mainPackageId: text("main_package_id").notNull(),
  subPackageId: text("sub_package_id"),
  serviceName: text("service_name").notNull(),
  serviceNameEn: text("service_name_en"),

  
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  status: text("status").notNull().default("not_started"), // ServiceStatus
  price: int("price"),
  currency: text("currency"),
  salesEmployeeId: text("sales_employee_id"), // Who brought the client
  executionEmployeeIds: json("execution_employee_ids").default(sql`(JSON_ARRAY())`), // Who executes the work (Array)
  notes: text("notes"),
  completedAt: timestamp("completed_at").default(sql`NULL`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientServiceSchema = createInsertSchema(clientServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export type InsertClientService = z.infer<typeof insertClientServiceSchema>;
export type ClientService = InferSelectModel<typeof clientServices>;

// Main Packages (Categories)
export const mainPackages = mysqlTable("main_packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon"),
  description: text("description"),
  descriptionEn: text("description_en"),
  order: int("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMainPackageSchema = createInsertSchema(mainPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMainPackage = z.infer<typeof insertMainPackageSchema>;
export type MainPackage = InferSelectModel<typeof mainPackages>;

// Sub-Packages (Plans)
export const subPackages = mysqlTable("sub_packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  mainPackageId: text("main_package_id").notNull(), // References mainPackages.id
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  price: int("price").notNull(),
  currency: text("currency").notNull(), // Currency enum
  billingType: text("billing_type").notNull(), // "one_time", "monthly", "quarterly", "yearly"
  description: text("description"),
  descriptionEn: text("description_en"),
  duration: text("duration"),
  durationEn: text("duration_en"),
  deliverables: json("deliverables").default(sql`(JSON_ARRAY())`), // Array of Deliverable
  platforms: json("platforms").default(sql`(JSON_ARRAY())`), // Array of Platform strings
  features: text("features"),
  featuresEn: text("features_en"),
  isActive: boolean("is_active").notNull().default(true),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubPackageSchema = createInsertSchema(subPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubPackage = z.infer<typeof insertSubPackageSchema>;
export type SubPackage = InferSelectModel<typeof subPackages>;

// Invoices
export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: text("client_id").notNull(),
  clientName: text("client_name").notNull(),
  amount: int("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("draft"), // "draft", "sent", "paid", "overdue"
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  items: json("items").notNull().default(sql`(JSON_ARRAY())`), // Array of items
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = InferSelectModel<typeof invoices>;

// Employees (HR Data)
export const employees = mysqlTable("employees", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull(), // Role/Job title in English
  roleAr: text("role_ar"), // Role/Job title in Arabic
  department: text("department"),
  jobTitle: text("job_title"), // Specific job title/specialization
  profileImage: text("profile_image"),
  // Salary Info
  salaryType: text("salary_type").notNull().default("monthly"), // "monthly", "per_project"
  salaryAmount: int("salary_amount"),
  rate: int("rate"),
  rateType: text("rate_type"), // "per_project", "per_task", "per_service"
  salaryCurrency: text("salary_currency").notNull().default("USD"),
  salaryNotes: text("salary_notes"),
  startDate: text("start_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = InferSelectModel<typeof employees>;

// Service Deliverables (Progress Tracking)
export const serviceDeliverables = mysqlTable("service_deliverables", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  serviceId: text("service_id").notNull(), // References clientServices.id
  key: text("key").notNull(), // Deliverable key (e.g., "posts", "reels")
  labelAr: text("label_ar").notNull(),
  labelEn: text("label_en").notNull(),
  target: int("target").notNull(), // Total required
  completed: int("completed").notNull().default(0), // Completed count
  icon: text("icon"),
  isBoolean: boolean("is_boolean").default(false), // For Yes/No deliverables like "Website Live"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceDeliverableSchema = createInsertSchema(serviceDeliverables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceDeliverable = z.infer<typeof insertServiceDeliverableSchema>;
export type ServiceDeliverable = InferSelectModel<typeof serviceDeliverables>;

// Work Activity Log (for tracking updates)
export const workActivityLogs = mysqlTable("work_activity_logs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  serviceId: text("service_id").notNull(),
  deliverableId: text("deliverable_id"),
  employeeId: text("employee_id"),
  action: text("action").notNull(), // "updated", "completed", "status_changed"
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkActivityLogSchema = createInsertSchema(workActivityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkActivityLog = z.infer<typeof insertWorkActivityLogSchema>;
export type WorkActivityLog = InferSelectModel<typeof workActivityLogs>;

// Service Reports
export const serviceReports = mysqlTable("service_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  serviceId: text("service_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceReportSchema = createInsertSchema(serviceReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertServiceReport = z.infer<typeof insertServiceReportSchema>;
export type ServiceReport = InferSelectModel<typeof serviceReports>;

// Transactions (Finance)
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  description: text("description").notNull(),
  amount: int("amount").notNull(),
  currency: text("currency").notNull(), // Currency enum
  type: text("type").notNull(), // TransactionType enum (income, expense)
  category: text("category").notNull(), // ExpenseCategory enum or other
  date: text("date").notNull(),
  relatedId: text("related_id"), // Reference to invoiceId, employeeId, etc.
  relatedType: text("related_type"), // "invoice", "salary", "project", "other"
  status: text("status").notNull().default("completed"), // "pending", "completed", "cancelled"
  notes: text("notes"),
  clientId: text("client_id"), // For income transactions
  serviceId: text("service_id"), // For income transactions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = InferSelectModel<typeof transactions>;

// Client Payments
export const clientPayments = mysqlTable("client_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  clientId: text("client_id").notNull(),
  serviceId: text("service_id"),
  amount: int("amount").notNull(),
  currency: text("currency").notNull(),
  paymentDate: text("payment_date").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientPaymentSchema = createInsertSchema(clientPayments).omit({
  id: true,
  createdAt: true,
});

export type InsertClientPayment = z.infer<typeof insertClientPaymentSchema>;
export type ClientPayment = InferSelectModel<typeof clientPayments>;

// Goals (Targets)
export const goals = mysqlTable("goals", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  type: text("type").notNull(), // GoalType enum
  month: int("month").notNull(),
  year: int("year").notNull(),
  target: int("target").notNull(),
  current: int("current").default(0),
  currency: text("currency"),
  icon: text("icon"),
  notes: text("notes"),
  status: text("status").notNull().default("not_started"), // "not_started", "in_progress", "achieved", "failed"
  responsiblePerson: text("responsible_person"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = InferSelectModel<typeof goals>;

// Goal Statuses
export const GoalStatusEnum = z.enum(["not_started", "in_progress", "achieved", "failed"]);
export type GoalStatus = z.infer<typeof GoalStatusEnum>;

// Goal Form Schema (for routes.ts)
export const goalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: GoalTypeEnum,
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  target: z.number().min(0),
  current: z.number().min(0).optional(),
  currency: CurrencyEnum.optional().nullable(),
  icon: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: GoalStatusEnum.optional(),
  responsiblePerson: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;

// Calendar Event Types
export const EventTypeEnum = z.enum([
  "manual",
  "package_end",
  "delivery_due",
  "payroll",
  "client_payment",
  "task"
]);
export type EventType = z.infer<typeof EventTypeEnum>;

export const EventStatusEnum = z.enum(["upcoming", "today", "overdue", "done"]);
export type EventStatus = z.infer<typeof EventStatusEnum>;

export const EventPriorityEnum = z.enum(["low", "medium", "high"]);
export type EventPriority = z.infer<typeof EventPriorityEnum>;

export const eventTypeConfigs = {
  manual: { color: "#3b82f6", labelAr: "يدوي", labelEn: "Manual" },
  package_end: { color: "#ef4444", labelAr: "نهاية باقة", labelEn: "Package End" },
  delivery_due: { color: "#f59e0b", labelAr: "تسليم عمل", labelEn: "Delivery Due" },
  payroll: { color: "#10b981", labelAr: "راتب", labelEn: "Payroll" },
  client_payment: { color: "#8b5cf6", labelAr: "دفعة عميل", labelEn: "Client Payment" },
  task: { color: "#f97316", labelAr: "مهمة", labelEn: "Task" },
};

// Calendar Events
export const calendarEvents = mysqlTable("calendar_events", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  source: text("source").notNull().default("manual"), // "manual", "system"
  eventType: text("event_type").notNull().default("manual"), // EventType
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  date: text("date").notNull(), // ISO Date string (YYYY-MM-DD)
  time: text("time"), // HH:mm format
  status: text("status").notNull().default("upcoming"), // EventStatus
  priority: text("priority").notNull().default("medium"), // EventPriority
  clientId: text("client_id"),
  serviceId: text("service_id"),
  employeeId: text("employee_id"),
  salesId: text("sales_id"),
  notes: text("notes"),
  reminderDays: text("reminder_days"), // JSON array of numbers
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = InferSelectModel<typeof calendarEvents>;

// Notifications
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "info", "success", "warning", "error", "reminder"
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  snoozedUntil: timestamp("snoozed_until").default(sql`NULL`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = InferSelectModel<typeof notifications>;

// Break Types
export const BreakTypeEnum = z.enum(["short", "long", "lunch"]);
export type BreakType = z.infer<typeof BreakTypeEnum>;

// Work Segment Schema
export const WorkSegmentSchema = z.object({
  type: z.enum(["work", "break"]),
  startAt: z.string(),
  endAt: z.string().optional(),
  breakType: BreakTypeEnum.optional(),
  note: z.string().optional(),
});
export type WorkSegment = z.infer<typeof WorkSegmentSchema>;

// Work Sessions
export const workSessions = mysqlTable("work_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  employeeId: text("employee_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  startTime: timestamp("start_time").default(sql`NULL`),
  endTime: timestamp("end_time").default(sql`NULL`),
  status: text("status").notNull().default("not_started"),
  segments: json("segments").notNull().default(sql`(JSON_ARRAY())`),
  totalDuration: int("total_duration").notNull().default(0), // in seconds
  breakDuration: int("break_duration").notNull().default(0), // in seconds
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkSessionSchema = createInsertSchema(workSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type WorkSession = InferSelectModel<typeof workSessions>;

// Payroll Payments (History)
export const payrollPayments = mysqlTable("payroll_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  employeeId: text("employee_id").notNull(),
  amount: int("amount").notNull(),
  currency: text("currency").notNull(),
  paymentDate: text("payment_date").notNull(),
  period: text("period").notNull(), // e.g. "2026-01"
  status: text("status").notNull().default("paid"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPayrollPaymentSchema = createInsertSchema(payrollPayments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayrollPayment = z.infer<typeof insertPayrollPaymentSchema>;
export type PayrollPayment = InferSelectModel<typeof payrollPayments>;

// Employee Salaries (Configuration) - Note: This might overlap with employees table fields, 
// but can be used for detailed history or complex structures. 
// For now, we use fields in 'employees' table.
export const employeeSalaries = mysqlTable("employee_salaries", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  employeeId: text("employee_id").notNull(),
  amount: int("amount").notNull(),
  currency: text("currency").notNull(),
  effectiveDate: text("effective_date").notNull(),
  type: text("type").notNull(), // "basic", "bonus", "deduction"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSalarySchema = createInsertSchema(employeeSalaries).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployeeSalary = z.infer<typeof insertEmployeeSalarySchema>;
export type EmployeeSalary = InferSelectModel<typeof employeeSalaries>;

// System Settings
export const systemSettings = mysqlTable("system_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default("current"),
  settings: json("settings").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings);

export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = InferSelectModel<typeof systemSettings>;

// Exchange Rates
export const exchangeRates = mysqlTable("exchange_rates", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  base: text("base").notNull().default("USD"),
  date: text("date").notNull(),
  rates: text("rates").notNull(), // JSON string with currency rates
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  fetchedAt: true,
});

export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type ExchangeRate = InferSelectModel<typeof exchangeRates>;
