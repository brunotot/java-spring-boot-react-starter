import { type LmsTranslationFn } from "@/shared/utils/i18nutils";

export type AppRouteHandle = {
  breadcrumb: (t: LmsTranslationFn, params: Record<string, string | undefined>) => string;
  linkable?: boolean;
};
