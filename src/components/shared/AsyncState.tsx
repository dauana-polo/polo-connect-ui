import type { ReactNode } from "react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

type Props<T> = {
  loading: boolean;
  error?: unknown;
  data: T[] | null | undefined;
  onRetry?: () => void;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  children: (data: T[]) => ReactNode;
};

/**
 * Renderiza automaticamente loading/error/empty ou o conteúdo.
 * Padroniza os três estados de tela para toda query de lista.
 */
export function AsyncState<T>({
  loading,
  error,
  data,
  onRetry,
  loadingLabel,
  emptyTitle = "Nenhum registro",
  emptyDescription,
  emptyIcon,
  emptyAction,
  children,
}: Props<T>) {
  if (loading) return <LoadingState label={loadingLabel} />;
  if (error) {
    const msg = error instanceof Error ? error.message : undefined;
    return <ErrorState message={msg} onRetry={onRetry} />;
  }
  const list = data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
      />
    );
  }
  return <>{children(list)}</>;
}
