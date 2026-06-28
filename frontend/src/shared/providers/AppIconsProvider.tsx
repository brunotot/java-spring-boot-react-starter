import { LMS_ICON_REGISTRY } from "@/setup/icons/icons.registry";
import { RgoIconsProvider, type RgoProvider } from "@rgo/front-ui";

export const AppIconsProvider: RgoProvider = ({ children }) => {
  return <RgoIconsProvider icons={LMS_ICON_REGISTRY}>{children}</RgoIconsProvider>;
};
