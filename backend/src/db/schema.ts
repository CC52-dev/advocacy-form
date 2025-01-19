import { sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  varchar,
  uuid,
  timestamp,
  text,
  PgArray,
} from "drizzle-orm/pg-core";
export const applicantsTable = pgTable("applicants", {
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
  over16: boolean("over16"),
  appliedAt: timestamp("applied_at").defaultNow(),
});
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
  over16: boolean("over16"),
  acceptedAt: timestamp("accepted_at").defaultNow(),
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

export const applicantsSessionTable = pgTable("applicantSession", {
  id: text("id").primaryKey(),
  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicantsTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const otpTable = pgTable("otp", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email"),
  otp: varchar("otp"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Applicant = typeof applicantsTable.$inferInsert;
export type Otp = typeof otpTable.$inferInsert;
export type User = typeof usersTable.$inferInsert;
export type Session = typeof sessionTable.$inferInsert;
export type ApplicantSession = typeof applicantsSessionTable.$inferInsert;
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
