import type { ReactNode } from "react";
import { usePermissions, type Resource, type Action } from "@/hooks/usePermissions";

type Props = {
  resource: Resource;
  action?: Action;
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Gate visual — esconde children para quem não tem permissão.
 * Use para ocultar botões/menus. Não substitui o RLS (é apenas UI).
 */
export function Can({ resource, action = "view", fallback = null, children }: Props) {
  const { can } = usePermissions();
  if (!can(resource, action)) return <>{fallback}</>;
  return <>{children}</>;
}
