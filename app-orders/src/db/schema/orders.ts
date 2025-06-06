import { integer, pgEnum, pgTable, text, timestamp } from "../../../node_modules/drizzle-orm/pg-core/index.d.cts";
import { customers } from "./customers.ts";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "canceled",
]);

export const orders = pgTable("orders", {
  id: text().primaryKey(),
  customerId: text()
    .notNull()
    .references(() => customers.id),
  amount: integer().notNull(),
  status: orderStatusEnum().notNull().default("pending"),
  createdAt: timestamp().notNull().defaultNow(),
});
