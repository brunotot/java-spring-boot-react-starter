import { type LMS_ICON_REGISTRY } from "@/setup/icons/icons.registry";
import type React from "react";

declare module "@rgo/front-ui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RgoIconRegistry extends Record<keyof typeof LMS_ICON_REGISTRY, React.ComponentType> {}
}
