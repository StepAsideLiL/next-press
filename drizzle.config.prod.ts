import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations/prod",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
