import { createFileRoute } from "@tanstack/react-router";
import { Check, Clipboard, Search, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/laczek/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { commandCategories, totalCommands } from "@/lib/command-data";

export const Route = createFileRoute("/commands")({
  head: () => ({ meta: [
    { title: "WhatsApp Bot Commands | LACZEK MD" },
    { name: "description", content: "Search and copy the complete LACZEK MD WhatsApp bot command list." },
    { property: "og:title", content: "WhatsApp Bot Commands | LACZEK MD" },
    { property: "og:description", content: "Search and copy the complete LACZEK MD WhatsApp bot command list." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: CommandsPage,
});

function CommandsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase().replace(/^\./, "");
  const filtered = useMemo(() => commandCategories
    .filter((item) => category === "All" || item.name === category)
    .map((item) => ({ ...item, commands: item.commands.filter((command) => command.includes(normalizedQuery)) }))
    .filter((item) => item.commands.length > 0), [category, normalizedQuery]);
  const matchCount = filtered.reduce((total, item) => total + item.commands.length, 0);

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(`.${command}`);
      setCopied(command);
      toast.success(`.${command} copied`);
      window.setTimeout(() => setCopied(null), 1500);
    } catch { toast.error("Could not copy command"); }
  }

  return (
    <PageShell title="Bot Commands" subtitle={`${totalCommands} commands grouped by category. Search, then tap any command to copy it with the dot prefix.`}>
      <div className="sticky top-3 z-20 mb-6 space-y-3 rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-md">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <span className="sr-only">Search commands</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search commands..." className="h-11 w-full rounded-md border border-input bg-surface-raised pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20" />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Command categories">
          {["All", ...commandCategories.map((item) => item.name)].map((name) => (
            <Button key={name} type="button" size="sm" variant={category === name ? "default" : "outline"} onClick={() => setCategory(name)}>{name}</Button>
          ))}
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{matchCount} {matchCount === 1 ? "command" : "commands"}</span>
        <span>Prefix: <strong className="text-foreground">.</strong></span>
      </div>
      {filtered.length ? (
        <Accordion type="multiple" defaultValue={filtered.length < 5 ? filtered.map((item) => item.name) : [filtered[0]?.name ?? ""]} className="space-y-3">
          {filtered.map((item) => (
            <AccordionItem key={item.name} value={item.name} className="rounded-lg border border-border bg-card px-4">
              <AccordionTrigger className="hover:no-underline"><span className="flex items-center gap-3"><Terminal className="size-4 text-accent" /><span>{item.name}</span><span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.commands.length}</span></span></AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {item.commands.map((command) => (
                    <Button key={command} type="button" variant="outline" onClick={() => copyCommand(command)} className="h-auto min-h-10 justify-between overflow-hidden px-3 py-2 font-mono text-xs">
                      <span className="truncate">.{command}</span>{copied === command ? <Check /> : <Clipboard />}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No commands found. Try another search.</div>}
    </PageShell>
  );
}