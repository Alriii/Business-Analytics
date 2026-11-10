CREATE UNIQUE INDEX "products_owner_id_idx"
ON "products" USING btree ("owner_id","id");
--> statement-breakpoint

ALTER TABLE "harvests"
ADD CONSTRAINT "harvests_owner_product_fk"
FOREIGN KEY ("owner_id","product_id")
REFERENCES "public"."products"("owner_id","id")
ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "sales"
ADD CONSTRAINT "sales_owner_product_fk"
FOREIGN KEY ("owner_id","product_id")
REFERENCES "public"."products"("owner_id","id")
ON DELETE no action ON UPDATE no action;