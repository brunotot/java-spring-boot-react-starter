import { type UserRole } from "@/features/auth/models/UserRole";
import z from "zod";

export const ApiAuth = z.object({
  login: z.custom<(username: string, password: string) => Promise<{ username: string; message: string }>>(),
  logout: z.custom<() => Promise<void>>(),
  me: z.custom<() => Promise<{ username: string; role: UserRole | null }>>(),
});

export type ApiAuth = z.infer<typeof ApiAuth>;
