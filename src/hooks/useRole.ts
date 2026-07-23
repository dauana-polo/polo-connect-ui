import { useAuth, type AppRole } from "./useAuth";

/**
 * Convenience hook for role checks. Wraps useAuth to avoid every route
 * re-implementing the "does this user have role X" pattern.
 */
export function useRole() {
  const { roles, loading, isAdmin, isGestor, hasRole } = useAuth();
  return {
    roles,
    loading,
    isAdmin,
    isGestor,
    hasRole,
    isAny: (list: AppRole[]) => list.some((r) => hasRole(r)),
  };
}
