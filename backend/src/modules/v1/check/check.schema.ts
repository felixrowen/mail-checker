import { z } from "zod";

const extractDomain = (input: string): string => {
  if (input.includes("@")) {
    return input.split("@")[1] || input;
  }
  return input.replace(/^https?:\/\//, "");
};

export const createCheckSchema = z.object({
  domain: z.string().min(1).transform(extractDomain),
});

export type CreateCheckInput = z.infer<typeof createCheckSchema>;
