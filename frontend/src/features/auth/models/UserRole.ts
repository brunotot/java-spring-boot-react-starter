import z from "zod";

export const UserRole = z.enum(["USER", "SUPERADMIN"]);
export type UserRole = z.infer<typeof UserRole>;
