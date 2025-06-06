import { defineConfig } from "./node_modules/drizzle-kit/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured");
}

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schema: "src/db/schema/*",
  out: "src/db/migrations",
  casing: "snake_case",
});
