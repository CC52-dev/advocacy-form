import { sql } from "drizzle-orm";
import {
  boolean,
  mysqlTable,
  varchar,
  char,
  timestamp,
  text,
  mysqlEnum,
  json
} from "drizzle-orm/mysql-core";

export const userEnum = mysqlEnum("type", ["admin", "user", "applicant", "disabled"]);

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

export type Help = typeof helpTable.$inferSelect;
export type Otp = typeof otpTable.$inferSelect;
export type User = typeof usersTable.$inferInsert;
export type Session = typeof sessionTable.$inferInsert;
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
