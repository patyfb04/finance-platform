import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plaidId: text("plaid_id").default(""),
  userId: text("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
// export const transactions = pgTable("transactions", {
//   id: serial("id").primaryKey(),
//   amount: text("amount").notNull(),
// });
// export const categories = pgTable("categories", {
//   id: serial("id").primaryKey(),
//   name: text("name").notNull(),
// });
// export const users = pgTable("users", {
//   id: text("id").primaryKey(),
//   email: text("email").notNull(),
//   created_at: timestamp("created_at").defaultNow().notNull(),
// });
// export const settings = pgTable("settings", {
//   id: serial("id").primaryKey(),
//   userId: text("user_id").notNull(),
//   theme: text("theme").notNull(),
// });
