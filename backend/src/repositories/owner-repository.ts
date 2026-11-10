import { eq } from "drizzle-orm";
import { db } from "@/db";
import { owners } from "@/schema";

export const findOwnerById = (ownerId: string) => {
  return db.query.owners.findFirst({
    where: eq(owners.id, ownerId),
    columns: { id: true, email: true, fullName: true, farmName: true, createdAt: true },
  });
};
