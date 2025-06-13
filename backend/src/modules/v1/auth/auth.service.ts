import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

export const createUser = async (email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return user;
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
