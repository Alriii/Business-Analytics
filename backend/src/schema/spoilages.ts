import {
    pgTable,
    uuid,
    numeric,
    varchar,
    timestamp,
    foreignKey,
} from "drizzle-orm/pg-core";

import { owners } from "./owners.js";
import { products } from "./products.js";

export const spoilages = pgTable("spoilages", {
    id: uuid("id").defaultRandom().primaryKey(),

    ownerId: uuid("owner_id")
        .notNull()
        .references(() => owners.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),

    quantity: numeric("quantity", {
        precision: 10,
        scale: 2,
    }).notNull(),

    reason: varchar("reason", { length: 150 }).notNull(),

    recordedAt: timestamp("recorded_at", {
        withTimezone: true,
    }).defaultNow().notNull(),
},
    (table) => [
        foreignKey({
            columns: [table.ownerId, table.productId],
            foreignColumns: [products.ownerId, products.id],
            name: "spoilages_owner_product_fk",
        }),
    ],
);