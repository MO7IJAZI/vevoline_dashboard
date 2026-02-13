CREATE TABLE `calendar_events` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`source` text NOT NULL DEFAULT ('manual'),
	`event_type` text NOT NULL DEFAULT ('manual'),
	`title_ar` text NOT NULL,
	`title_en` text,
	`date` text NOT NULL,
	`time` text,
	`status` text NOT NULL DEFAULT ('upcoming'),
	`priority` text NOT NULL DEFAULT ('medium'),
	`client_id` text,
	`service_id` text,
	`employee_id` text,
	`sales_id` text,
	`notes` text,
	`reminder_days` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_payments` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`client_id` text NOT NULL,
	`service_id` text,
	`amount` int NOT NULL,
	`currency` text NOT NULL,
	`payment_date` text NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`payment_method` text,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `client_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_services` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`client_id` text NOT NULL,
	`main_package_id` text NOT NULL,
	`sub_package_id` text,
	`service_name` text NOT NULL,
	`service_name_en` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`status` text NOT NULL DEFAULT ('not_started'),
	`price` int,
	`currency` text,
	`sales_employee_id` text,
	`execution_employee_ids` json DEFAULT (JSON_ARRAY()),
	`notes` text,
	`completed_at` timestamp NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `client_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_users` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`email` text NOT NULL,
	`password` text NOT NULL,
	`client_id` text NOT NULL,
	`client_name` text NOT NULL,
	`client_name_en` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login` timestamp NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `client_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`company` text,
	`country` text,
	`source` text,
	`status` text NOT NULL DEFAULT ('active'),
	`sales_owner_id` text,
	`assigned_manager_id` text,
	`converted_from_lead_id` text,
	`lead_created_at` timestamp NULL,
	`sales_owners` json DEFAULT (JSON_ARRAY()),
	`assigned_staff` json DEFAULT (JSON_ARRAY()),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_salaries` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`employee_id` text NOT NULL,
	`amount` int NOT NULL,
	`currency` text NOT NULL,
	`effective_date` text NOT NULL,
	`type` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `employee_salaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`name_en` text,
	`email` text NOT NULL,
	`phone` text,
	`role` text NOT NULL,
	`role_ar` text,
	`department` text,
	`job_title` text,
	`profile_image` text,
	`salary_type` text NOT NULL DEFAULT ('monthly'),
	`salary_amount` int,
	`rate` int,
	`rate_type` text,
	`salary_currency` text NOT NULL DEFAULT ('USD'),
	`salary_notes` text,
	`start_date` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`base` text NOT NULL DEFAULT ('USD'),
	`date` text NOT NULL,
	`rates` text NOT NULL,
	`fetched_at` timestamp DEFAULT (now()),
	CONSTRAINT `exchange_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`type` text NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`target` int NOT NULL,
	`current` int DEFAULT 0,
	`currency` text,
	`icon` text,
	`notes` text,
	`status` text NOT NULL DEFAULT ('not_started'),
	`responsible_person` text,
	`country` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`email` text NOT NULL,
	`role` text NOT NULL DEFAULT ('employee'),
	`permissions` json DEFAULT (JSON_ARRAY()),
	`token` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`status` text NOT NULL DEFAULT ('pending'),
	`name` text,
	`name_en` text,
	`department` text,
	`employee_id` text,
	`used_at` timestamp NULL,
	`invited_by` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`invoice_number` text NOT NULL,
	`client_id` text NOT NULL,
	`client_name` text NOT NULL,
	`amount` int NOT NULL,
	`currency` text NOT NULL,
	`status` text NOT NULL DEFAULT ('draft'),
	`issue_date` text NOT NULL,
	`due_date` text NOT NULL,
	`paid_date` text,
	`items` json NOT NULL DEFAULT (JSON_ARRAY()),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`company` text,
	`country` text,
	`source` text,
	`stage` text NOT NULL DEFAULT ('new'),
	`deal_value` int,
	`deal_currency` text,
	`notes` text,
	`negotiator_id` text,
	`was_confirmed_client` boolean DEFAULT false,
	`converted_from_client_id` text,
	`preserved_client_data` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `main_packages` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`name` text NOT NULL,
	`name_en` text NOT NULL,
	`icon` text,
	`description` text,
	`description_en` text,
	`order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `main_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`snoozed_until` timestamp NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_resets` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`email` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `password_resets_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_resets_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `payroll_payments` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`employee_id` text NOT NULL,
	`amount` int NOT NULL,
	`currency` text NOT NULL,
	`payment_date` text NOT NULL,
	`period` text NOT NULL,
	`status` text NOT NULL DEFAULT ('paid'),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payroll_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_deliverables` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`service_id` text NOT NULL,
	`key` text NOT NULL,
	`label_ar` text NOT NULL,
	`label_en` text NOT NULL,
	`target` int NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`icon` text,
	`is_boolean` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `service_deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_reports` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`service_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `service_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sid` varchar(255) NOT NULL,
	`sess` json NOT NULL,
	`expire` timestamp NOT NULL,
	CONSTRAINT `session_sid` PRIMARY KEY(`sid`)
);
--> statement-breakpoint
CREATE TABLE `sub_packages` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`main_package_id` text NOT NULL,
	`name` text NOT NULL,
	`name_en` text NOT NULL,
	`price` int NOT NULL,
	`currency` text NOT NULL,
	`billing_type` text NOT NULL,
	`description` text,
	`description_en` text,
	`duration` text,
	`duration_en` text,
	`deliverables` json DEFAULT (JSON_ARRAY()),
	`platforms` json DEFAULT (JSON_ARRAY()),
	`features` text,
	`features_en` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`order` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `sub_packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` varchar(255) NOT NULL DEFAULT 'current',
	`settings` json NOT NULL,
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`description` text NOT NULL,
	`amount` int NOT NULL,
	`currency` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`date` text NOT NULL,
	`related_id` text,
	`related_type` text,
	`status` text NOT NULL DEFAULT ('completed'),
	`notes` text,
	`client_id` text,
	`service_id` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL DEFAULT ('employee'),
	`permissions` json DEFAULT (JSON_ARRAY()),
	`avatar` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`name_en` text,
	`department` text,
	`employee_id` text,
	`last_login` timestamp NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `work_activity_logs` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`service_id` text NOT NULL,
	`deliverable_id` text,
	`employee_id` text,
	`action` text NOT NULL,
	`previous_value` text,
	`new_value` text,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `work_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_sessions` (
	`id` varchar(255) NOT NULL DEFAULT (UUID()),
	`employee_id` text NOT NULL,
	`date` text NOT NULL,
	`start_time` timestamp NULL,
	`end_time` timestamp NULL,
	`status` text NOT NULL DEFAULT ('not_started'),
	`segments` json NOT NULL DEFAULT (JSON_ARRAY()),
	`total_duration` int NOT NULL DEFAULT 0,
	`break_duration` int NOT NULL DEFAULT 0,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `work_sessions_id` PRIMARY KEY(`id`)
);
