import { createFileRoute, Link } from "@tanstack/react-router";
import { Link2, MessageCircle, Server, Smartphone } from "lucide-react";

import { PageShell } from "@/components/laczek/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-to-use")({
  head: () => ({ meta: [
    { title: "How to Use LACZEK MD" },
    { name: "description", content: "Pair LACZEK MD with WhatsApp and start using bot commands." },
    { property: "og:title", content: "How to Use LACZEK MD" },
    { property: "og:description", content: "Pair LACZEK MD with WhatsApp and start using bot commands." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: HowToUsePage,
});

const steps = [
  { icon: Server, title: "Choose a server", text: "Open Home, select a server, and wait until it shows ready." },
  { icon: Smartphone, title: "Enter your WhatsApp number", text: "Include the country code without + or spaces. For Uganda, start with 256." },
  { icon: Link2, title: "Link the device", text: "Generate the code, then open WhatsApp → Linked devices → Link with phone number and enter it." },
  { icon: MessageCircle, title: "Send a command", text: "Open a chat and send a command with a dot prefix, such as .menu, .ping, or .play." },
];

function HowToUsePage() {
  return <PageShell title="How to Use" subtitle="Connect your WhatsApp account, then run commands directly inside your chats.">
    <div className="grid gap-3 sm:grid-cols-2">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="rounded-lg border border-border bg-card p-5"><div className="mb-4 flex size-9 items-center justify-center rounded-md bg-muted"><Icon className="size-4 text-accent" /></div><p className="mb-1 text-xs font-semibold text-muted-foreground">STEP {index + 1}</p><h2 className="font-semibold text-foreground">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div>
    <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/">Pair Device</Link></Button><Button variant="outline" asChild><Link to="/commands">View Commands</Link></Button></div>
  </PageShell>;
}