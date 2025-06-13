import { Request, Response } from "express";
import { successResponse, errorResponse } from "@/utils/response";
import { checkDomain } from "./check.service";
import { AuthRequest } from "@/middlewares/auth";
import { createCheckSchema } from "./check.schema";

export const checkDomainHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = createCheckSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(
      errorResponse({
        message: "Invalid request",
        errors: result.error.flatten().fieldErrors,
      })
    );
    return;
  }

  const { domain } = result.data;
  const userId = req.user!.id;

  const checkResult = await checkDomain(domain, userId);

  res.json(successResponse(checkResult));
};
