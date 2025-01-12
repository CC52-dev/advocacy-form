import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const applicants = pgTable("applicants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstname: varchar({ length: 256 }),
	lastname: varchar({ length: 256 }),
	phone: varchar({ length: 256 }),
	email: varchar({ length: 256 }),
	location: varchar({ length: 256 }),
	addr: varchar({ length: 256 }),
	city: varchar({ length: 256 }),
	zip: varchar({ length: 256 }),
	interest: varchar({ length: 256 }),
	over16: boolean(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstname: varchar({ length: 256 }),
	lastname: varchar({ length: 256 }),
	phone: varchar({ length: 256 }),
	email: varchar({ length: 256 }),
	location: varchar({ length: 256 }),
	addr: varchar({ length: 256 }),
	city: varchar({ length: 256 }),
	zip: varchar({ length: 256 }),
	interest: varchar({ length: 256 }),
	over16: boolean(),
	acceptedAt: timestamp("accepted_at", { mode: 'string' }).defaultNow(),
});
