import type { Request, Response, NextFunction } from "express";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function authRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (current.count >= MAX_ATTEMPTS) {
    res
      .status(429)
      .json({ error: "TOO_MANY_AUTH_ATTEMPTS", message: "Try again later." });
    return;
  }

  current.count += 1;
  next();
}