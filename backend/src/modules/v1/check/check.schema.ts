import { z } from "zod";

export const createCheckSchema = z.object({
  domain: z.string().min(1, "Domain is required").url("Must be a valid URL"),
});

export type CreateCheckInput = z.infer<typeof createCheckSchema>;
