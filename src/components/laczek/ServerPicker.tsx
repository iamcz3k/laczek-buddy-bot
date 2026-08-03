import { ChevronDown, Circle, Server, Users, Loader2 } from "lucide-react";

import { allServers } from "@/lib/servers";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "ready"; count: number; limit: number }
  | { kind: "full"; count: number; limit: number }
  | { kind: "offline" };

export function ServerPicker({
  open,
  selectedServer,
  status,
  onOpen,
  onSelect,
}: {
  open: boolean;
  selectedServer: string | null;
  status: Status;
  onOpen: () => void;
  onSelect: (id: string) => void;
}) {
  const serverNumber = selectedServer ? selectedServer.replace("server", "") : null;

  if (open) {
    return (
      <div className="mb-5 max-h-[300px] animate-fade-in overflow-y-auto rounded-2xl border border-border bg-surface p-5">
        <p className="mb-4 text-center text-base font-semibold text-foreground">
          Select a Server (1-100)
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {allServers.map((server) => (
            <button
              key={server.id}
              type="button"
              onClick={() => onSelect(server.id)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/10 ${
                selectedServer === server.id
                  ? "border-accent bg-accent/15"
                  : "border-border bg-surface-raised"
              }`}
            >
              <span className="text-sm font-medium text-foreground">{server.name}</span>
              <span className="text-xs text-muted-foreground">Click to select</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/15"
    >
      <span className="flex items-center gap-3">
        <Server className="size-5 text-accent" />
        <span>
          <span className="block text-sm font-semibold text-foreground">
            {serverNumber
              ? `Server ${serverNumber}${status.kind === "checking" ? " (Checking...)" : ""}`
              : "Select Server"}
          </span>
          <span className="mt-0.5 flex gap-4 text-xs text-muted-foreground">
            <StatusLeft status={status} />
            <StatusRight status={status} />
          </span>
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface-raised px-4 py-2 text-xs font-medium text-foreground">
        <ChevronDown className="size-3.5" />
        Select
      </span>
    </button>
  );
}

function StatusLeft({ status }: { status: Status }) {
  if (status.kind === "checking") {
    return (
      <span className="flex items-center gap-1.5">
        <Circle className="size-2.5 fill-current" /> Checking...
      </span>
    );
  }
  if (status.kind === "offline") {
    return (
      <span className="flex items-center gap-1.5 text-destructive">
        <Circle className="size-2.5 fill-current" /> Status: OFFLINE
      </span>
    );
  }
  if (status.kind === "full") {
    return (
      <span className="flex items-center gap-1.5 text-warning">
        <Circle className="size-2.5 fill-current" /> Status: FULL
      </span>
    );
  }
  if (status.kind === "ready") {
    return (
      <span className="flex items-center gap-1.5">
        <Circle className="size-2.5 fill-success text-success" /> Active: {status.count}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <Circle className="size-2.5 fill-success text-success" /> Active: --
    </span>
  );
}

function StatusRight({ status }: { status: Status }) {
  if (status.kind === "checking") {
    return (
      <span className="flex items-center gap-1.5">
        <Loader2 className="size-3 animate-spin" /> Loading
      </span>
    );
  }
  if (status.kind === "offline") {
    return <span className="flex items-center gap-1.5">Server Down</span>;
  }
  if (status.kind === "ready" || status.kind === "full") {
    return (
      <span className="flex items-center gap-1.5">
        <Users className="size-3" />
        {status.kind === "full"
          ? `${status.count}/${status.limit}`
          : `Limit: ${status.count}/${status.limit}`}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <Users className="size-3" /> Limit: --/50
    </span>
  );
}

export type { Status as ServerStatus };
