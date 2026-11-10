
import {
    pgTable,
    uuid,
    varchar,
    numeric,
    timestamp,
} from "drizzle-orm/pg-core";

import { owners } from "./owners.js";

export const expenses = pgTable("expenses", {
    id: uuid("id").defaultRandom().primaryKey(),

    ownerId: uuid("owner_id")
        .notNull()
        .references(() => owners.id, { onDelete: "cascade" }),

    category: varchar("category", { length: 100 }).notNull(),

    description: varchar("description", { length: 255 }),

    amount: numeric("amount", {
        precision: 10,
        scale: 2,
    }).notNull(),

    expenseDate: timestamp("expense_date", {
        withTimezone: true,
    }).defaultNow().notNull(),
});
