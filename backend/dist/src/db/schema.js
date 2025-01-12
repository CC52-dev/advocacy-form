import { boolean, pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
export const applicantsTable = pgTable('applicants', {
    id: uuid("id").defaultRandom().primaryKey(),
    firstname: varchar('firstname', { length: 256 }),
    lastname: varchar('lastname', { length: 256 }),
    phone: varchar('phone', { length: 256 }),
    email: varchar('email', { length: 256 }),
    location: varchar('location', { length: 256 }),
    addr: varchar('addr', { length: 256 }),
    city: varchar('city', { length: 256 }),
    zip: varchar('zip', { length: 256 }),
    interest: varchar('interest', { length: 256 }),
    over16: boolean('over16'),
    appliedAt: timestamp('applied_at').defaultNow(),
});
export const usersTable = pgTable('users', {
    id: uuid("id").defaultRandom().primaryKey(),
    firstname: varchar('firstname', { length: 256 }),
    lastname: varchar('lastname', { length: 256 }),
    phone: varchar('phone', { length: 256 }),
    email: varchar('email', { length: 256 }),
    location: varchar('location', { length: 256 }),
    addr: varchar('addr', { length: 256 }),
    city: varchar('city', { length: 256 }),
    zip: varchar('zip', { length: 256 }),
    interest: varchar('interest', { length: 256 }),
    over16: boolean('over16'),
    acceptedAt: timestamp('accepted_at').defaultNow(),
});
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
