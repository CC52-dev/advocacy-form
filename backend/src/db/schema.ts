import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  varchar,
  uuid,
  timestamp,
  text,
  PgArray,
  pgEnum
} from "drizzle-orm/pg-core";

export const userEnum = pgEnum("type", ["admin", "user", "applicant", "disabled"]);

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstname: varchar("firstname"),
  lastname: varchar("lastname"),
  phone: varchar("phone"),
  email: varchar("email"),
  location: text("location")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  addr: varchar("addr"),
  city: varchar("city"),
  zip: varchar("zip"),
  interest: text("interest")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  over16: boolean("over16")
    .notNull()
    .default(false),
  appliedAt: timestamp("applied_at").defaultNow(),
  acceptedAt: timestamp("accepted_at")
  .default(sql`NULL`),
  type: userEnum().default("applicant"),
});
export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});



export const otpTable = pgTable("otp", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email")
  .notNull()
  .references(() => usersTable.email),
  userId: uuid("user_id")
  .notNull()
  .references(() => usersTable.id),
  otp: varchar("otp", { length: 6 }).notNull().default(sql`floor(random() * (999999 - 100000 + 1) + 100000)::text`)
  .notNull(),
  createdAt: timestamp("created_at").defaultNow(),});
export const helpTable = pgTable("help", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  lastModified: timestamp("last_modified").notNull(),
  authorId: varchar("authorId").notNull().references(() => usersTable.id),
  image: varchar("image").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
