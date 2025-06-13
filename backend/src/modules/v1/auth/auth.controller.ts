import { Request, Response } from "express";
import { registerSchema } from "./auth.schema";

export const register = (req: Request, res: Response): void => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid request",
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password } = result.data;

  res.json({ email, password });
};

export const login = (req: Request, res: Response): void => {
  res.send("Login");
};
