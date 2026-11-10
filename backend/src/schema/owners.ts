import {
    pgTable,
    uuid,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";

export const owners = pgTable("owners", {
    id: uuid("id").defaultRandom().primaryKey(),

    fullName: varchar("full_name", { length: 100 }).notNull(),

    farmName: varchar("farm_name", { length: 150 }).notNull(),

    email: varchar("email", { length: 255 })
        .notNull()
        .unique(),

    passwordHash: varchar("password_hash", { length: 255 })
        .notNull(),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});