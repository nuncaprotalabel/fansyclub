import { Router, type IRouter } from "express";
import { CheckAccessQueryParams, CheckAccessResponse } from "@workspace/api-zod";
import { loadSession, requireAuth, canAccess } from "../lib/auth";

const router: IRouter = Router();

router.use(loadSession);

router.get("/access/check", requireAuth, (req, res): void => {
  const parsed = CheckAccessQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_PERMISSION", message: parsed.error.message });
    return;
  }

  res.json(
    CheckAccessResponse.parse({
      allowed: canAccess(req.user!, parsed.data.permission),
      permission: parsed.data.permission,
      role: req.user!.role,
    }),
  );
});

export default router;