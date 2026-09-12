import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SiteMenu } from "@/components/laczek/SiteMenu";

export function PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="bg-matte pointer-events-none fixed inset-0" />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Button variant="ghost" asChild>
            <Link to="/" className="gap-2"><ArrowLeft /> Home</Link>
          </Button>
          <SiteMenu />
        </header>
        <section className="mb-8">
          <div className="mb-4 flex size-14 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised">
            <img src="/laczek-logo.jpg" alt="LACZEK MD logo" className="size-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>
        </section>
        {children}
      </div>
    </main>
  );
}