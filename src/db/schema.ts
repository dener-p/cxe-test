import {
  int,
  json,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core"

export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey().notNull(),
  userId: varchar("userId", { length: 191 }).notNull(),
  status: varchar("status", { length: 191 }).notNull(),
  value: int("value").notNull(),
  products: json("products").notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
  orderId: varchar("orderId", { length: 191 }).notNull(),
})

export const apisKey = mysqlTable("api_keys", {
  id: serial("id").primaryKey().notNull(),
  key: varchar("key", { length: 191 }).notNull(),
  secret: varchar("secret", { length: 191 }).notNull(),
  userId: varchar("userId", { length: 191 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "string" }).defaultNow().notNull(),
})
