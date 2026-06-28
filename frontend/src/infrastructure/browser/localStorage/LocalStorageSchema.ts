import z from "zod";

export const LocalStorageLocale = z.enum(["en", "hr"]);
export const LocalStoragePageBodyMaxWidth = z.union([z.enum(["xs", "sm", "md", "lg", "xl"]), z.literal(false)]);
export type LocalStoragePageBodyMaxWidthValue = z.infer<typeof LocalStoragePageBodyMaxWidth>;

export const LocalStorageSchema = z.object({
  darkMode: z.boolean(),
  locale: LocalStorageLocale,
  navCollapsed: z.boolean(),
  navWidth: z.number().int().min(72).max(420),
  navLocked: z.boolean(),
  pageBodyMaxWidth: LocalStoragePageBodyMaxWidth,
});

export type LocalStorageSchema = z.infer<typeof LocalStorageSchema>;
