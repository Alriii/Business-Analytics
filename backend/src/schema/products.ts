import {
    pgTable,
    uuid,
    varchar,
    numeric,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { owners } from "./owners.js";

export const products = pgTable(
    "products",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        ownerId: uuid("owner_id")
            .notNull()
            .references(() => owners.id, { onDelete: "cascade" }),

        name: varchar("name", { length: 100 }).notNull(),

        category: varchar("category", { length: 80 }).notNull(),

        unit: varchar("unit", { length: 20 }).notNull(),

        unitPrice: numeric("unit_price", {
            precision: 10,
            scale: 2,
        }).notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex("products_owner_name_idx").on(
            table.ownerId,
            table.name,
        ),

        uniqueIndex("products_owner_id_idx").on(
            table.ownerId,
            table.id,),
    ],


);