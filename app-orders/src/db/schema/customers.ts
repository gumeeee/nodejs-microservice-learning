import { date, pgTable, text } from "../../../node_modules/drizzle-orm/pg-core/index.d.cts";

export const customers = pgTable("customers", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  address: text().notNull(),
  state: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  dateOfBirth: date({ mode: "date" }),
});
