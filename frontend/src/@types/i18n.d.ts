import type EnglishTranslations from "@/setup/translations/translation.en";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof EnglishTranslations;
    };
  }
}
