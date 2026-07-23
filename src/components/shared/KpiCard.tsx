import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "positive" | "warning" | "danger";
  className?: string;
};

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-red-500",
};

export function KpiCard({ label, value, hint, icon, tone = "default", className }: Props) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        </div>
        <div className={cn("mt-2 text-2xl font-semibold", toneClass[tone])}>{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
