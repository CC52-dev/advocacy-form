import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstname: varchar(),
	lastname: varchar(),
	phone: varchar(),
	email: varchar(),
	location: varchar(),
	addr: varchar(),
	city: varchar(),
	zip: varchar(),
	interest: varchar(),
	over16: boolean(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }).defaultNow(),
});

export const applicants = pgTable("applicants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstname: varchar(),
	lastname: varchar(),
	phone: varchar(),
	email: varchar(),
	location: varchar(),
	addr: varchar(),
	city: varchar(),
	zip: varchar(),
	interest: varchar(),
	over16: boolean(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
});
