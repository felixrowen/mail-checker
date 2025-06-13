import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth";
import { checkDomainHandler } from "./check.controller";

const router = Router();

router.post("/", authMiddleware, checkDomainHandler);

export default router;
