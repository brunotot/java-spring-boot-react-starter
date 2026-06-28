import { useAuthContext } from "@/features/auth/hooks/contexts/useAuthContext";
import { UserRole, type UserRole as UserRoleValue } from "@/features/auth/models/UserRole";

const { USER, SUPERADMIN } = UserRole.enum;

export const APP_PERMISSIONS = {
  "page:home": [USER, SUPERADMIN],
  "page:countries": [USER, SUPERADMIN],
  "page:settings": [USER, SUPERADMIN],
  "country:edit": [SUPERADMIN],
} as const satisfies Record<string, readonly UserRoleValue[]>;

export type AppPermission = keyof typeof APP_PERMISSIONS;

export function appCan(role: UserRoleValue | null | undefined, permission: AppPermission): boolean {
  if (role == null) {
    return false;
  }

  return (APP_PERMISSIONS[permission] as readonly UserRoleValue[]).includes(role);
}

export function useAppCan(permission: AppPermission): boolean {
  const { role } = useAuthContext();
  return appCan(role, permission);
}
