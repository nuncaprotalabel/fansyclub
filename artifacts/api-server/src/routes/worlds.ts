import { Router, type IRouter } from "express";
import { and, eq, or } from "drizzle-orm";
import {
  CreateWorldBody,
  CreateWorldResponse,
  GetPublicWorldParams,
  GetPublicWorldResponse,
  ListMyWorldsResponse,
} from "@workspace/api-zod";
import { db, worldMembershipsTable, worldsTable } from "@workspace/db";
import { canAccess, loadSession, requireAuth } from "../lib/auth";
import { recordAuditLog } from "../lib/audit";

const router: IRouter = Router();

router.use(loadSession);

router.get("/worlds", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const worlds =
    user.role === "OWNER" || user.role === "STAFF"
      ? await db.select().from(worldsTable).orderBy(worldsTable.createdAt)
      : await db
          .select({ world: worldsTable })
          .from(worldsTable)
          .leftJoin(
            worldMembershipsTable,
            eq(worldMembershipsTable.worldId, worldsTable.id),
          )
          .where(
            or(
              eq(worldsTable.ownerId, user.id),
              eq(worldMembershipsTable.userId, user.id),
            ),
          )
          .then((rows) => rows.map((row) => row.world));

  res.json(ListMyWorldsResponse.parse(worlds));
});

router.post("/worlds", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  if (!canAccess(user, "worlds.create_own")) {
    res.status(403).json({ error: "FORBIDDEN" });
    return;
  }

  const parsed = CreateWorldBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "INVALID_WORLD", message: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select({ id: worldsTable.id })
    .from(worldsTable)
    .where(eq(worldsTable.slug, parsed.data.slug))
    .limit(1);
  if (existing) {
    res.status(409).json({ error: "WORLD_SLUG_ALREADY_EXISTS" });
    return;
  }

  const [world] = await db
    .insert(worldsTable)
    .values({
      ownerId: user.id,
      name: parsed.data.name.trim(),
      slug: parsed.data.slug,
    })
    .returning();
  if (!world) {
    res.status(500).json({ error: "WORLD_CREATION_FAILED" });
    return;
  }

  await db.insert(worldMembershipsTable).values({
    worldId: world.id,
    userId: user.id,
    role: "OWNER",
  });
  await recordAuditLog({
    actorUserId: user.id,
    action: "world.created",
    resourceType: "world",
    resourceId: world.id,
  });
  res.status(201).json(CreateWorldResponse.parse(world));
});

router.get("/worlds/:slug", async (req, res): Promise<void> => {
  const params = GetPublicWorldParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "INVALID_WORLD_SLUG" });
    return;
  }

  const [world] = await db
    .select()
    .from(worldsTable)
    .where(
      and(eq(worldsTable.slug, params.data.slug), eq(worldsTable.status, "PUBLISHED")),
    )
    .limit(1);
  if (!world) {
    res.status(404).json({ error: "WORLD_NOT_FOUND" });
    return;
  }

  res.json(GetPublicWorldResponse.parse(world));
});

export default router;