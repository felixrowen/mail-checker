import { Request, Response } from "express";
import { registerSchema } from "./auth.schema";
import { createUser, getUserByEmail } from "./auth.service";
import { errorResponse, successResponse } from "@/utils/response";

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json(
      errorResponse({
        message: "Invalid request",
        errors: result.error.flatten().fieldErrors,
      })
    );
    return;
  }

  const { email, password } = result.data;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(500).json(
        errorResponse({
          message: "User already exists with this email",
        })
      );
      return;
    }

    const user = await createUser(email, password);
    res.status(201).json(
      successResponse({
        id: user.id,
        email: user.email,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
};

export const login = (req: Request, res: Response): void => {
  res.send("Login");
};
