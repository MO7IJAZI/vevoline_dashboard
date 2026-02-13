
import { pgTable, text, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const session = pgTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("employee"),
  permissions: jsonb("permissions").default(sql`'[]'::jsonb`),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  nameEn: text("name_en"),
  department: text("department"),
  employeeId: text("employee_id"),
  lastLogin: timestamp("last_login"),
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

export const clientUsers = pgTable("client_users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  clientId: text("client_id").notNull(),
  clientName: text("client_name").notNull(),
  clientNameEn: text("client_name_en"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
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

export const invitations = pgTable("invitations", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  role: text("role").notNull().default("employee"),
  permissions: jsonb("permissions").default(sql`'[]'::jsonb`),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status").notNull().default("pending"),
  name: text("name"),
  nameEn: text("name_en"),
  department: text("department"),
  employeeId: text("employee_id"),
  usedAt: timestamp("used_at"),
  invitedBy: text("invited_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
});

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = InferSelectModel<typeof invitations>;

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

export const passwordResets = pgTable("password_resets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
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

export const GoalTypeEnum = z.enum([
  "financial",
  "clients",
  "leads",
  "projects",
  "performance",
  "custom"
]);

export type GoalType = z.infer<typeof GoalTypeEnum>;

export const CurrencyEnum = z.enum(["TRY", "USD", "EUR", "SAR", "EGP", "AED"]);
export type Currency = z.infer<typeof CurrencyEnum>;

export const TransactionTypeEnum = z.enum(["income", "expense"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

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

export const leads = pgTable("leads", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  country: text("country"),
  source: text("source"),
  stage: text("stage").notNull().default("new"),
  dealValue: integer("deal_value"),
  dealCurrency: text("deal_currency"),
  notes: text("notes"),
  negotiatorId: text("negotiator_id"),
  wasConfirmedClient: boolean("was_confirmed_client").default(false),
  convertedFromClientId: text("converted_from_client_id"),
  preservedClientData: jsonb("preserved_client_data"),
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

export const clients = pgTable("clients", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  country: text("country"),
  source: text("source"),
  status: text("status").notNull().default("active"),
  salesOwnerId: text("sales_owner_id"),
  assignedManagerId: text("assigned_manager_id"),
  convertedFromLeadId: text("converted_from_lead_id"),
  leadCreatedAt: timestamp("lead_created_at"),
  salesOwners: jsonb("sales_owners").default(sql`'[]'::jsonb`),
  assignedStaff: jsonb("assigned_staff").default(sql`'[]'::jsonb`),
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

export const clientServices = pgTable("client_services", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  clientId: text("client_id").notNull(),
  mainPackageId: text("main_package_id").notNull(),
  subPackageId: text("sub_package_id"),
  serviceName: text("service_name").notNull(),
  serviceNameEn: text("service_name_en"),

  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  status: text("status").notNull().default("not_started"),
  price: integer("price"),
  currency: text("currency"),
  salesEmployeeId: text("sales_employee_id"),
  executionEmployeeIds: jsonb("execution_employee_ids").default(sql`'[]'::jsonb`),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
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

export const mainPackages = pgTable("main_packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon"),
  description: text("description"),
  descriptionEn: text("description_en"),
  order: integer("order").notNull().default(0),
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

export const subPackages = pgTable("sub_packages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  mainPackageId: text("main_package_id").notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull(),
  billingType: text("billing_type").notNull(),
  description: text("description"),
  descriptionEn: text("description_en"),
  duration: text("duration"),
  durationEn: text("duration_en"),
  deliverables: jsonb("deliverables").default(sql`'[]'::jsonb`),
  platforms: jsonb("platforms").default(sql`'[]'::jsonb`),
  features: text("features"),
  featuresEn: text("features_en"),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
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

export const invoices = pgTable("invoices", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: text("client_id").notNull(),
  clientName: text("client_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull().default("draft"),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  items: jsonb("items").notNull().default(sql`'[]'::jsonb`),
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

export const employees = pgTable("employees", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull(),
  roleAr: text("role_ar"),
  department: text("department"),
  jobTitle: text("job_title"),
  profileImage: text("profile_image"),
  salaryType: text("salary_type").notNull().default("monthly"),
  salaryAmount: integer("salary_amount"),
  rate: integer("rate"),
  rateType: text("rate_type"),
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

export const serviceDeliverables = pgTable("service_deliverables", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  serviceId: text("service_id").notNull(),
  key: text("key").notNull(),
  labelAr: text("label_ar").notNull(),
  labelEn: text("label_en").notNull(),
  target: integer("target").notNull(),
  completed: integer("completed").notNull().default(0),
  icon: text("icon"),
  isBoolean: boolean("is_boolean").default(false),
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

export const workActivityLogs = pgTable("work_activity_logs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  serviceId: text("service_id").notNull(),
  deliverableId: text("deliverable_id"),
  employeeId: text("employee_id"),
  action: text("action").notNull(),
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

export const serviceReports = pgTable("service_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
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

export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  relatedId: text("related_id"),
  relatedType: text("related_type"),
  status: text("status").notNull().default("completed"),
  notes: text("notes"),
  clientId: text("client_id"),
  serviceId: text("service_id"),
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

export const clientPayments = pgTable("client_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  clientId: text("client_id").notNull(),
  serviceId: text("service_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  paymentDate: text("payment_date").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
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

export const goals = pgTable("goals", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  target: integer("target").notNull(),
  current: integer("current").default(0),
  currency: text("currency"),
  icon: text("icon"),
  notes: text("notes"),
  status: text("status").notNull().default("not_started"),
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

export const GoalStatusEnum = z.enum(["not_started", "in_progress", "achieved", "failed"]);
export type GoalStatus = z.infer<typeof GoalStatusEnum>;

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

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull().default("manual"),
  eventType: text("event_type").notNull().default("manual"),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  date: text("date").notNull(),
  time: text("time"),
  status: text("status").notNull().default("upcoming"),
  priority: text("priority").notNull().default("medium"),
  clientId: text("client_id"),
  serviceId: text("service_id"),
  employeeId: text("employee_id"),
  salesId: text("sales_id"),
  notes: text("notes"),
  reminderDays: text("reminder_days"),
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

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en"),
  messageAr: text("message_ar").notNull(),
  messageEn: text("message_en"),
  read: boolean("read").notNull().default(false),
  relatedId: text("related_id"),
  relatedType: text("related_type"),
  snoozedUntil: timestamp("snoozed_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = InferSelectModel<typeof notifications>;

export const BreakTypeEnum = z.enum(["short", "long", "lunch"]);
export type BreakType = z.infer<typeof BreakTypeEnum>;

export const WorkSegmentSchema = z.object({
  type: z.enum(["work", "break"]),
  startAt: z.string(),
  endAt: z.string().optional(),
  breakType: BreakTypeEnum.optional(),
  note: z.string().optional(),
});
export type WorkSegment = z.infer<typeof WorkSegmentSchema>;

export const workSessions = pgTable("work_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull(),
  date: text("date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("not_started"),
  segments: jsonb("segments").notNull().default(sql`'[]'::jsonb`),
  totalDuration: integer("total_duration").notNull().default(0),
  breakDuration: integer("break_duration").notNull().default(0),
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

export const payrollPayments = pgTable("payroll_payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  paymentDate: text("payment_date").notNull(),
  period: text("period").notNull(),
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

export const employeeSalaries = pgTable("employee_salaries", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  effectiveDate: text("effective_date").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSalarySchema = createInsertSchema(employeeSalaries).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployeeSalary = z.infer<typeof insertEmployeeSalarySchema>;
export type EmployeeSalary = InferSelectModel<typeof employeeSalaries>;

export const systemSettings = pgTable("system_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default("current"),
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings);

export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = InferSelectModel<typeof systemSettings>;

export const exchangeRates = pgTable("exchange_rates", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`gen_random_uuid()`),
  base: text("base").notNull().default("USD"),
  date: text("date").notNull(),
  rates: text("rates").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  fetchedAt: true,
});

export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type ExchangeRate = InferSelectModel<typeof exchangeRates>;
