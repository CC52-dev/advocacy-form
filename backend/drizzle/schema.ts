import { pgTable, uuid, varchar, boolean, timestamp, foreignKey, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_user_id_users_id_fk"
		}),
]);

export const applicantSession = pgTable("applicantSession", {
	id: text().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
});
