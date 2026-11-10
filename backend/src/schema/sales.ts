import {
    pgTable,
    uuid,
    numeric,
    timestamp,
    foreignKey,
} from "drizzle-orm/pg-core";

import { owners } from "./owners.js";
import { products } from "./products.js";

export const sales = pgTable("sales", {
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

    unitPrice: numeric("unit_price", {
        precision: 10,
        scale: 2,
    }).notNull(),

    soldAt: timestamp("sold_at", {
        withTimezone: true,
    }).defaultNow().notNull(),
},
    (table) => [
        foreignKey({
            columns: [table.ownerId, table.productId],
            foreignColumns: [products.ownerId, products.id],
            name: "sales_owner_product_fk",
        }),
    ]);