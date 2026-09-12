import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Info, Key, Lightbulb, Loader2, Hourglass, Phone } from "lucide-react";

import { CodeBox } from "@/components/laczek/CodeBox";
import { ServerPicker, type ServerStatus } from "@/components/laczek/ServerPicker";
import { SiteMenu } from "@/components/laczek/SiteMenu";
import { generatePairCode, getServerStatus } from "@/lib/pair.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LACZEK MD | WhatsApp Pairing Code Generator" },
      {
        name: "description",
        content:
          "Generate a WhatsApp pairing code for LACZEK MD in seconds. Pick a server, enter your number, no deployment needed.",
      },
      { property: "og:title", content: "LACZEK MD | WhatsApp Pairing Code Generator" },
      {
        property: "og:description",
        content:
          "Generate a WhatsApp pairing code for LACZEK MD in seconds. Pick a server, enter your number, no deployment needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const checkStatus = useServerFn(getServerStatus);
  const requestCode = useServerFn(generatePairCode);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [status, setStatus] = useState<ServerStatus>({ kind: "idle" });
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const refreshStatus = useCallback(
    async (serverId: string, announce: boolean) => {
      const serverNumber = serverId.replace("server", "");
      try {
        const result = await checkStatus({ data: { server: serverId } });

        if (result.offline) {
          setStatus({ kind: "offline" });
          setCode(null);
          setError(`Server ${serverNumber} is offline. Please select another server.`);
          if (announce) toast.error(`Server ${serverNumber} is offline`);
          return;
        }

        if (result.count >= result.limit) {
          setStatus({ kind: "full", count: result.count, limit: result.limit });
          setCode(null);
          setError(`Server ${serverNumber} is full! Please select another server.`);
          if (announce) toast.error(`Server ${serverNumber} is full`);
          return;
        }

        setStatus({ kind: "ready", count: result.count, limit: result.limit });
        setError(null);
        if (announce) toast.success(`Server ${serverNumber} is ready!`);
      } catch {
        setStatus({ kind: "offline" });
        setCode(null);
        setError(`Server ${serverNumber} is not responding. Please select another server.`);
        if (announce) toast.error(`Server ${serverNumber} is offline`);
      }
    },
    [checkStatus],
  );

  async function handleSelect(serverId: string) {
    setSelectedServer(serverId);
    setStatus({ kind: "checking" });
    setPickerOpen(false);
    await refreshStatus(serverId, true);
  }

  function startCooldown() {
    if (cooldownRef.current) return;
    setCooldown(30);
    cooldownRef.current = setInterval(() => {
      setCooldown((seconds) => {
        if (seconds <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedServer) {
      setCode(null);
      setError("Please select a server first");
      toast.error("Please select a server first");
      setPickerOpen(true);
      return;
    }

    const cleaned = phone.replace(/\D/g, "");

    if (!cleaned) {
      setCode(null);
      setError("Please enter your WhatsApp number");
      toast.error("Phone number is required");
      return;
    }

    if (cleaned.length < 10 || cleaned.length > 15) {
      setCode(null);
      setError("Please enter a valid phone number (10-15 digits)");
      toast.error("Invalid phone number format");
      return;
    }

    setLoading(true);
    setCode(null);
    setError(null);

    try {
      const result = await requestCode({ data: { server: selectedServer, number: cleaned } });
      setCode(result.code);
      toast.success("Pair code generated successfully!");
      await refreshStatus(selectedServer, false);
      startCooldown();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate code";
      setCode(null);
      setError(message);
      toast.error(message);
      await refreshStatus(selectedServer, false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }

  const generateDisabled =
    loading || cooldown > 0 || status.kind !== "ready" || selectedServer === null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="bg-matte pointer-events-none fixed inset-0 z-0" />
      <div className="glow-haze haze-one pointer-events-none fixed z-[1]" />
      <div className="glow-haze haze-two pointer-events-none fixed z-[1]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-5">
        <div className="card-matte animate-slide-in w-full max-w-[480px] rounded-[30px] border border-border p-8 px-6 sm:px-8">
          <div className="absolute right-4 top-4 z-20">
            <SiteMenu />
          </div>
          <header className="mb-8 text-center">
            <div className="relative mx-auto mb-5 size-20 sm:size-[90px]">
              <div className="logo-ring absolute inset-0 rounded-full" />
              <div className="logo-orb flex size-full items-center justify-center overflow-hidden rounded-full">
                <img
                  src="/laczek-logo.jpg"
                  alt="LACZEK MD logo"
                  width={90}
                  height={90}
                  className="size-full object-cover"
                />
              </div>
            </div>
            <h1 className="mb-2 text-[26px] font-bold tracking-tight text-foreground sm:text-[28px]">
              LACZEK MD
            </h1>
            <p className="text-sm text-muted-foreground">Generate Your Pairing Code</p>
          </header>

          <ServerPicker
            open={pickerOpen}
            selectedServer={selectedServer}
            status={status}
            onOpen={() => setPickerOpen(true)}
            onSelect={handleSelect}
          />

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <strong className="mb-1 block text-[15px] text-foreground">Quick Setup</strong>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Select a server, enter your WhatsApp number to instantly generate a pairing code. No
                deployment needed!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="phoneNumber"
                className="mb-2.5 block text-sm font-medium text-foreground"
              >
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                <input
                  id="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                  onFocus={() => setError(null)}
                  placeholder="25670423xxxx"
                  className="w-full rounded-2xl border-2 border-border bg-surface-raised py-4 pl-14 pr-5 text-[15px] text-foreground transition-all placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="size-3" />
                Include country code (e.g., 256 for Uganda)
              </p>
            </div>

            {loading ? (
              <div className="my-5 text-center">
                <Loader2 className="mx-auto mb-3 size-10 animate-spin text-accent" />
                <p className="text-sm text-muted-foreground">Generating your pair code...</p>
              </div>
            ) : (
              <button
                type="submit"
                disabled={generateDisabled}
                className="btn-generate mb-4 flex w-full items-center justify-center gap-2.5 rounded-2xl p-4 text-base font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {cooldown > 0 ? (
                  <>
                    <Hourglass className="size-5" /> Wait {cooldown}s
                  </>
                ) : (
                  <>
                    <Key className="size-5" /> Generate Pair Code
                  </>
                )}
              </button>
            )}

            <CodeBox code={code} error={error} />

            {code ? (
              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-surface-raised p-4 text-base font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-surface"
              >
                {copied ? (
                  <>
                    <Check className="size-5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-5" /> Copy Code
                  </>
                )}
              </button>
            ) : null}
          </form>

          <footer className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-xs text-muted-foreground/80">
              © 2026 LACZEK MD | Powered By LaczekTech
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
