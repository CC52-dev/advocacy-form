import { sql } from "drizzle-orm";
import {
  boolean,
  mysqlTable,
  varchar,
  char,
  timestamp,
  text,
  mysqlEnum,
  json,
  unique
} from "drizzle-orm/mysql-core";

export const userEnum = mysqlEnum("type", ["admin", "user", "applicant", "disabled", "adminviewer"]);

export const usersTable = mysqlTable("users", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  firstname: varchar("firstname", { length: 255 }),
  lastname: varchar("lastname", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  location: json("location").notNull().default(sql`JSON_ARRAY()`),
  addr: varchar("addr", { length: 255 }),
  city: varchar("city", { length: 255 }),
  zip: varchar("zip", { length: 10 }),
  interest: json("interest").notNull().default(sql`JSON_ARRAY()`),
  over16: boolean("over16").notNull().default(false),
  appliedAt: timestamp("applied_at").default(sql`CURRENT_TIMESTAMP`),
  acceptedAt: timestamp("accepted_at").default(sql`NULL`),
  type: userEnum.default("applicant"),
});

export const sessionTable = mysqlTable("session", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: char("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at").notNull(),
});

export const otpTable = mysqlTable("otp", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 })
    .notNull()
    .references(() => usersTable.email),
  userId: char("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  otp: varchar("otp", { length: 6 }).notNull().default(sql`FLOOR(RAND() * (999999 - 100000 + 1) + 100000)`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const helpTable = mysqlTable("help", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  lastModified: timestamp("last_modified").notNull(),
  authorId: varchar("authorId", { length: 36 }).notNull().references(() => usersTable.id),
  image: varchar("image", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Single user_roles table - stores role title, permissions, and is_protected as a permission
export const userRolesTable = mysqlTable("user_roles", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: char("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  roleTitle: varchar("role_title", { length: 255 }).notNull(),
  permissions: json("permissions").notNull().default(sql`JSON_ARRAY()`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userRoleUnique: unique().on(table.userId, table.roleTitle),
}));

// External applications table for dev permission
// rolesDefinition JSON structure (now called permissionsDefinition):
// {
//   permissions: [
//     {
//       code: "content.edit",
//       name: "Edit Content",
//       category: "content",
//       constraints: {
//         exclusive: false,           // User can only have this permission (no others)
//         onlyOneInCategory: true,    // User can only have one permission from this category
//         prerequisites: ["content.read"]  // Permissions required before this one can be assigned
//       }
//     }
//   ]
// }
export const applicationsTable = mysqlTable("applications", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }),
  apiKey: varchar("api_key", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "pending"]).default("pending"),
  // Stores permission definitions (kept as roles_definition for DB compatibility)
  rolesDefinition: json("roles_definition").notNull().default(sql`JSON_OBJECT('permissions', JSON_ARRAY())`),
  createdBy: char("created_by", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Application user permissions - assigns users to application-specific permissions
// roleCode column stores permission codes (kept as role_code for DB compatibility)
export const applicationUserRolesTable = mysqlTable("application_user_roles", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: char("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  applicationId: char("application_id", { length: 36 })
    .notNull()
    .references(() => applicationsTable.id),
  // Stores permission code (e.g., "content.edit", "admin")
  roleCode: varchar("role_code", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
  userAppRoleUnique: unique().on(table.userId, table.applicationId, table.roleCode),
}));

// Application sessions for SSO-style launch tokens
// The "used" boolean was originally for one-time token verification.
// Now we reuse sessions if the same user session creates a new launch request
// and there's more than 1 hour left on the existing app session.
export const applicationSessionsTable = mysqlTable("application_sessions", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  token: varchar("token", { length: 255 }).notNull().unique(),
  userId: char("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  applicationId: char("application_id", { length: 36 })
    .notNull()
    .references(() => applicationsTable.id),
  // The user's main session ID that created this app session (for reuse logic)
  userSessionId: varchar("user_session_id", { length: 255 }),
  expiresAt: timestamp("expires_at").notNull(),
  // Tracks if token has been verified by the external app at least once
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Events table - admins create/manage events
export const eventStatusEnum = mysqlEnum("status", ["active", "disabled"]);
export const eventsTable = mysqlTable("events", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 500 }),
  eventDate: timestamp("event_date").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: eventStatusEnum.default("active"),
  createdBy: char("created_by", { length: 36 })
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Event RSVPs - any non-applicant user can RSVP
export const eventRsvpsTable = mysqlTable("event_rsvps", {
  id: char("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  eventId: char("event_id", { length: 36 })
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  userId: char("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  eventUserUnique: unique().on(table.eventId, table.userId),
}));

export type Help = typeof helpTable.$inferSelect;
export type Otp = typeof otpTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Event = typeof eventsTable.$inferSelect;
export type EventRsvp = typeof eventRsvpsTable.$inferSelect;
export type Session = typeof sessionTable.$inferSelect;
export type UserRole = typeof userRolesTable.$inferSelect;
export type Application = typeof applicationsTable.$inferSelect;
export type ApplicationUserRole = typeof applicationUserRolesTable.$inferSelect;
export type ApplicationSession = typeof applicationSessionsTable.$inferSelect;
// {
//     firstname: 'Balaji',
//     lastname: 'Yogesh',
//     phone: '+16128105922',
//     email: 'balaji.yogesh@gmail.com',
//     location: [ 'United States', 'Wisconsin' ],
//     addr: 'w239n2377 Hawks Meadow CT',
//     city: 'Waukesha ',
//     zip: '53072',
//     interest: [ 'Vedic Worship (USA)' ],
//     over16: true
//   }
