import { pgTable, uuid, varchar, timestamp, text, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const type = pgEnum("type", ['admin', 'user', 'applicant', 'disabled'])


export const otp = pgTable("otp", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar().notNull(),
	userId: uuid("user_id").notNull(),
	otp: varchar({ length: 6 }).default((floor(((random() * (((999999 - 100000) + 1))).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstname: varchar(),
	lastname: varchar(),
	phone: varchar(),
	email: varchar(),
	location: text().array().default(["RAY"]).notNull(),
	addr: varchar(),
	city: varchar(),
	zip: varchar(),
	interest: text().array().default(["RAY"]).notNull(),
	over16: boolean().default(false).notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }),
	type: type().default('applicant'),
});
