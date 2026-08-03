import { CheckCircle2, AlertCircle } from "lucide-react";

export function CodeBox({
  code,
  error,
}: {
  code: string | null;
  error: string | null;
}) {
  return (
    <div
      className={`mb-4 flex min-h-[70px] items-center justify-center rounded-2xl border-2 p-5 text-center transition-all ${
        code
          ? "border-success/50 bg-success/5"
          : error
            ? "border-destructive/50 bg-destructive/5"
            : "border-border bg-surface-sunken"
      }`}
    >
      {code ? (
        <span className="flex items-center gap-3 font-mono text-2xl font-bold tracking-[3px] text-success">
          <CheckCircle2 className="size-6" />
          <span>{code}</span>
        </span>
      ) : error ? (
        <span className="flex items-center gap-2.5 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Your pairing code will appear here</span>
      )}
    </div>
  );
}
