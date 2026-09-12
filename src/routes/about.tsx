import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Link2, ShieldCheck } from "lucide-react";

import { PageShell } from "@/components/laczek/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About LACZEK MD" },
    { name: "description", content: "Learn about the LACZEK MD WhatsApp pairing and command website." },
    { property: "og:title", content: "About LACZEK MD" },
    { property: "og:description", content: "Learn about the LACZEK MD WhatsApp pairing and command website." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  return <PageShell title="About LACZEK MD" subtitle="A simple matte-black website for pairing your WhatsApp account and finding available bot commands.">
    <div className="grid gap-3 sm:grid-cols-3">
      <article className="rounded-lg border border-border bg-card p-5"><Link2 className="mb-4 size-5 text-accent" /><h2 className="font-semibold">Fast pairing</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a live server and generate your WhatsApp pairing code.</p></article>
      <article className="rounded-lg border border-border bg-card p-5"><BookOpen className="mb-4 size-5 text-accent" /><h2 className="font-semibold">Command directory</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Search by name or category and copy commands with one tap.</p></article>
      <article className="rounded-lg border border-border bg-card p-5"><ShieldCheck className="mb-4 size-5 text-accent" /><h2 className="font-semibold">Service note</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Commands depend on the connected bot service and may change or become unavailable.</p></article>
    </div>
    <div className="mt-6 flex gap-3"><Button asChild><Link to="/">Get Pair Code</Link></Button><Button variant="outline" asChild><Link to="/commands">Browse Commands</Link></Button></div>
  </PageShell>;
}