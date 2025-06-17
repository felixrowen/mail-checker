import { Router } from "express";
import { checkDomainHandler, checkResultHistory, checkMailEchoHandler } from "./check.controller";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

router.post("/", authMiddleware, checkDomainHandler);
router.post("/mail-echo", authMiddleware, checkMailEchoHandler);
router.get("/history", authMiddleware, checkResultHistory);

export default router;
