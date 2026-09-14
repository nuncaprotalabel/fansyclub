import { createInsertSchema } from "drizzle-zod";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const worldStatusEnum = pgEnum("world_status", [
  "DRAFT",
  "PUBLISHED",
  "SUSPENDED",
]);

export const worldsTable = pgTable(
  "worlds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: worldStatusEnum("status").notNull().default("DRAFT"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugUniqueIndex: uniqueIndex("worlds_slug_unique").on(table.slug),
  }),
);

export const insertWorldSchema = createInsertSchema(worldsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorld = z.infer<typeof insertWorldSchema>;
export type World = typeof worldsTable.$inferSelect;