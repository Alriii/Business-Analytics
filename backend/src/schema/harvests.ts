import {
    pgTable,
    uuid,
    numeric,
    timestamp,
    foreignKey,
} from "drizzle-orm/pg-core";

import { owners } from "./owners.js";
import { products } from "./products.js";

export const harvests = pgTable("harvests", {
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

    harvestedAt: timestamp("harvested_at", {
        withTimezone: true,
    }).defaultNow().notNull(),
},
    (table) => [
        foreignKey({
            columns: [table.ownerId, table.productId],
            foreignColumns: [products.ownerId, products.id],
            name: "harvests_owner_product_fk",
        }),
    ],
);