import { Router, type IRouter } from "express";
import { and, eq, or } from "drizzle-orm";
import {
  db,
  usersTable,
  type User,
} from "@workspace/db";
import {
  GetCurrentUserResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  hashPassword,
  loadSession,
  requireAuth,
  setSessionCookie,
  verifyPassword,
} from "../lib/auth";
import { recordAuditLog, recordSecurityEvent } from "../lib/audit";
import { authRateLimit } from "../middlewares/auth-rate-limit";

const router: IRouter = Router();

function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

router.use(loadSession);

router.post("/auth/register", authRateLimit, async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "INVALID_REGISTRATION", message: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const username = parsed.data.username.trim().toLowerCase();
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
    .limit(1);

  if (existing) {
    res.status(409).json({ error: "USER_ALREADY_EXISTS" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      name: parsed.data.name.trim(),
      email,
      username,
      passwordHash: await hashPassword(parsed.data.password),
    })
    .returning();

  if (!user) {
    res.status(500).json({ error: "REGISTRATION_FAILED" });
    return;
  }

  const token = await createSession(user.id);
  setSessionCookie(res, token);
  await recordAuditLog({
    actorUserId: user.id,
    action: "auth.register",
    resourceType: "user",
    resourceId: user.id,
  });
  res.status(201).json(RegisterResponse.parse({ user: publicUser(user) }));
});

router.post("/auth/login", authRateLimit, async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "INVALID_LOGIN", message: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await recordSecurityEvent({
      eventType: "auth.login_failed",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      metadata: { email },
    });
    res.status(401).json({ error: "INVALID_CREDENTIALS" });
    return;
  }

  if (user.status !== "ACTIVE") {
    res.status(403).json({ error: "ACCOUNT_UNAVAILABLE" });
    return;
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(usersTable.id, user.id))
    .returning();
  const currentUser = updatedUser ?? user;
  const token = await createSession(currentUser.id);
  setSessionCookie(res, token);
  await recordAuditLog({
    actorUserId: currentUser.id,
    action: "auth.login",
    resourceType: "user",
    resourceId: currentUser.id,
  });
  res.json(LoginResponse.parse({ user: publicUser(currentUser) }));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.fansyclub_session as string | undefined;
  await deleteSession(token);
  clearSessionCookie(res);
  res.sendStatus(204);
});

router.get("/auth/me", requireAuth, (req, res): void => {
  res.json(GetCurrentUserResponse.parse(publicUser(req.user!)));
});

export default router;