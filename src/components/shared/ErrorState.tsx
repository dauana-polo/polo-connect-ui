import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Não foi possível carregar",
  message = "Ocorreu um erro ao consultar os dados. Tente novamente.",
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div>
        <p className="font-medium text-destructive">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1">
          <RotateCcw className="h-3 w-3" /> Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
