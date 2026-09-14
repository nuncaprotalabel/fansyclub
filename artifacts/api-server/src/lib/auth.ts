import {
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db, sessionsTable, usersTable, type User } from "@workspace/db";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "fansyclub_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const sessionSecret = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set");
  return secret;
})();

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

function tokenHash(token: string): string {
  return createHmac("sha256", sessionSecret).update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, salt, expectedHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return (
    expected.length === derivedKey.length &&
    timingSafeEqual(expected, derivedKey)
  );
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  await db.insert(sessionsTable).values({
    userId,
    tokenHash: tokenHash(token),
    lastSeenAt: now,
    expiresAt,
  });

  return token;
}

export async function deleteSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.tokenHash, tokenHash(token)));
}

export async function getSessionUser(
  token: string | undefined,
): Promise<{ user: User; sessionId: string } | null> {
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.tokenHash, tokenHash(token)),
        gt(sessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!session) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  if (!user || user.status !== "ACTIVE") return null;
  return { user, sessionId: session.id };
}

export async function loadSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  const session = await getSessionUser(token);
  if (session) {
    req.user = session.user;
    req.sessionId = session.sessionId;
  }
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: "AUTHENTICATION_REQUIRED" });
    return;
  }
  next();
}

export function requireRole(...roles: User["role"][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "AUTHENTICATION_REQUIRED" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "FORBIDDEN" });
      return;
    }
    next();
  };
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
}

export const PERMISSIONS = {
  CONTROL_CENTER_VIEW: "control_center.view",
  WORLDS_MANAGE: "worlds.manage",
  WORLDS_CREATE_OWN: "worlds.create_own",
  WORLDS_READ_OWN: "worlds.read_own",
  AUDIT_LOGS_READ: "audit_logs.read",
  SECURITY_EVENTS_READ: "security_events.read",
} as const;

export function canAccess(
  user: User,
  permission: string,
): boolean {
  if (user.role === "OWNER") return true;

  if (user.role === "STAFF") {
    const staffPermissions = new Set<string>([
      PERMISSIONS.CONTROL_CENTER_VIEW,
      PERMISSIONS.WORLDS_MANAGE,
      PERMISSIONS.AUDIT_LOGS_READ,
      PERMISSIONS.SECURITY_EVENTS_READ,
    ]);
    return staffPermissions.has(permission);
  }

  const userPermissions = new Set<string>([
    PERMISSIONS.WORLDS_CREATE_OWN,
    PERMISSIONS.WORLDS_READ_OWN,
  ]);
  return userPermissions.has(permission);
}