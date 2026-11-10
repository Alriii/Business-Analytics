ALTER TABLE "spoilages" DROP CONSTRAINT "harvests_owner_product_fk";
--> statement-breakpoint
ALTER TABLE "spoilages" ADD CONSTRAINT "spoilages_owner_product_fk" FOREIGN KEY ("owner_id","product_id") REFERENCES "public"."products"("owner_id","id") ON DELETE no action ON UPDATE no action;