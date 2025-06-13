import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { createUser, getUserByEmail, verifyPassword } from "./auth.service";
import { errorResponse, successResponse } from "@/utils/response";
import { signToken } from "@/lib/jwt";

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

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);

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
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json(
        errorResponse({
          message: "Invalid email or password",
        })
      );
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json(
        errorResponse({
          message: "Invalid email or password",
        })
      );
      return;
    }

    res.status(200).json(
      successResponse({
        id: user.id,
        email: user.email,
        token: signToken({ userId: user.id, email: user.email }),
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error));
  }
};
