import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "@/lib/db/relations";

export const db = drizzle(process.env.DATABASE_URL!, { relations });
export * from "@/lib/db/schema";
