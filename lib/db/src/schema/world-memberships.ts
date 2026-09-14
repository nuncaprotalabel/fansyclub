import { pgEnum, pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { worldsTable } from "./worlds";

export const worldMemberRoleEnum = pgEnum("world_member_role", [
  "OWNER",
  "EDITOR",
  "VIEWER",
]);

export const worldMembershipsTable = pgTable(
  "world_memberships",
  {
    worldId: uuid("world_id")
      .notNull()
      .references(() => worldsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: worldMemberRoleEnum("role").notNull().default("VIEWER"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    primaryKey: primaryKey({ columns: [table.worldId, table.userId] }),
  }),
);

export type WorldMembership = typeof worldMembershipsTable.$inferSelect;