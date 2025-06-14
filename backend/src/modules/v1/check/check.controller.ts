import { Request, Response } from "express";
import { successResponse, errorResponse } from "@/utils/response";
import { createCheckSchema } from "./check.schema";
import { runPythonCheck } from "@/lib/python-runner";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "@/middlewares/auth";

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

  try {
    const pythonResult = await runPythonCheck(domain);

    const checkResult = await prisma.check.create({
      data: {
        domain,
        result: pythonResult,
        userId,
      },
    });

    res.json(successResponse(checkResult));
  } catch (error) {
    res.status(500).json(errorResponse(error));
    return;
  }
};
