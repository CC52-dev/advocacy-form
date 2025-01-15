import { boolean, pgTable, varchar, uuid, timestamp, text } from "drizzle-orm/pg-core";
export const applicantsTable = pgTable('applicants', {
  id: uuid("id").defaultRandom().primaryKey(),
  firstname: varchar('firstname'),
  lastname: varchar('lastname'),
  phone: varchar('phone'),
  email: varchar('email'),
  location: varchar('location'),
  addr: varchar('addr'),
  city: varchar('city'),
  zip: varchar('zip'),
  interest: varchar('interest'),
  over16: boolean('over16'),
  appliedAt: timestamp('applied_at').defaultNow(),
});
export const usersTable = pgTable('users', {
  id: uuid("id").defaultRandom().primaryKey(),
  firstname: varchar('firstname'),
  lastname: varchar('lastname'),
  phone: varchar('phone'),
  email: varchar('email'),
  location: varchar('location'),
  addr: varchar('addr'),
  city: varchar('city'),
  zip: varchar('zip'),
  interest: varchar('interest'),
  over16: boolean('over16'),
  acceptedAt: timestamp('accepted_at').defaultNow(),
});
export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => usersTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});
export type Applicant = typeof applicantsTable.$inferInsert;
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