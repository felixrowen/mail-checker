import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth";
import { checkDomainHandler, checkResultHistory } from "./check.controller";

const router = Router();

router.post("/", authMiddleware, checkDomainHandler);
router.get("/history", authMiddleware, checkResultHistory);

export default router;
