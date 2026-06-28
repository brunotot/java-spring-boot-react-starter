import { createPersistentSignal } from "@/features/userSettings/signals/createPersistentSignal";
import {
  NAV_COLLAPSED_WIDTH,
  NAV_DEFAULT_EXPANDED_WIDTH,
  NAV_MAX_EXPANDED_WIDTH,
  NAV_MIN_EXPANDED_WIDTH,
} from "@/setup/layout/lmsNav.constants";

const navCollapsedState = createPersistentSignal("navCollapsed");
const navWidthState = createPersistentSignal("navWidth");
const navLockedState = createPersistentSignal("navLocked");

export const sigNavCollapsed = navCollapsedState.signal;
export const sigNavWidth = navWidthState.signal;
export const sigNavLocked = navLockedState.signal;

export function setNavCollapsedLocal(collapsed: boolean): void {
  navCollapsedState.setLocal(collapsed);
}

export function setNavWidthLocal(width: number): void {
  const clampedWidth = Math.max(NAV_MIN_EXPANDED_WIDTH, Math.min(width, NAV_MAX_EXPANDED_WIDTH));
  navWidthState.setLocal(clampedWidth);
}

export function setNavLockedLocal(locked: boolean): void {
  navLockedState.setLocal(locked);
}

export function ensureValidNavWidth(width: number): number {
  if (!Number.isFinite(width)) {
    return NAV_DEFAULT_EXPANDED_WIDTH;
  }

  if (width <= NAV_COLLAPSED_WIDTH) {
    return NAV_DEFAULT_EXPANDED_WIDTH;
  }

  return Math.max(NAV_MIN_EXPANDED_WIDTH, Math.min(width, NAV_MAX_EXPANDED_WIDTH));
}
