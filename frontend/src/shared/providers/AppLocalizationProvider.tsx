import { sigLocale } from "@/features/userSettings/signals/sigLocale";
import LmsTranslations from "@/setup/translations";
import { effect } from "@preact/signals-react";
import { configureI18nClient, RgoInitializeProvider, RgoLocalizationProvider, type RgoProvider } from "@rgo/front-ui";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/hr";
import i18n from "i18next";

function onInit() {
  configureI18nClient(i18n, {
    resources: LmsTranslations,
  });

  effect(() => {
    const locale = sigLocale.value;
    const applyLocale = async () => {
      await i18n.changeLanguage(locale);
      dayjs.locale(locale);
    };
    applyLocale();
  });
}

export const AppLocalizationProvider: RgoProvider = ({ children }) => {
  return (
    <RgoInitializeProvider onInit={onInit}>
      <RgoLocalizationProvider>{children}</RgoLocalizationProvider>
    </RgoInitializeProvider>
  );
};
