import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import worldsRouter from "./worlds";
import accessRouter from "./access";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(worldsRouter);
router.use(accessRouter);

export default router;
