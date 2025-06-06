import { drizzle } from "../../node_modules/drizzle-orm/node-postgres/index.d.cts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured.");
}
export const db = drizzle(process.env.DATABASE_URL, {
  casing: "snake_case",
});
