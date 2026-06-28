import type { ParseKeys } from "i18next";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: LmsQueryMeta;
    mutationMeta: LmsMutationMeta;
  }
}

export type LmsQueryMeta = {
  /** Skip the global error toast for this query. */
  silentError?: boolean;
  /**
   * Override the default "Error loading data" toast.
   * - `ParseKeys` for a translation key (type-checked against typed i18n resources).
   * - Function for a fully custom (already-translated) message.
   */
  errorMessage?: ParseKeys | ((error: unknown) => string | undefined);
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type LmsMutationMeta = {
  // Reserved for future use; mutation toasts are still driven by useLmsMutation.
};
