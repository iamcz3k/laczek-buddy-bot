import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, KeyRound, Search, Instagram, Send, Music2, MessageCircle, ArrowLeft, LockKeyhole } from "lucide-react";

export const Route = createFileRoute("/ban-bot")({ component: BanBot });

const platforms = [
  { id: "x", name: "X / Twitter", hint: "Username and linked phone number", icon: "𝕏" },
  { id: "tiktok", name: "TikTok", hint: "Username and linked phone number", icon: "♪" },
  { id: "whatsapp", name: "WhatsApp", hint: "WhatsApp number with country code", icon: "◉" },
  { id: "telegram", name: "Telegram", hint: "Username and linked phone number", icon: "➤" },
  { id: "instagram", name: "Instagram", hint: "Username and linked phone number", icon: "◎" },
];

function BanBot() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [platform, setPlatform] = useState("x");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [notice, setNotice] = useState("Access-key verification and case submission will activate after the secure server-side key store is configured.");
  const selected = platforms.find((p) => p.id === platform)!;

  function requestAccess(e: React.FormEvent) {
    e.preventDefault();
    setNotice("The secure access-key service is not connected yet. No key was accepted or stored. Admin key validation must run on the server, not in this browser.");
  }

  function submitCase(e: React.FormEvent) {
    e.preventDefault();
    setNotice("Case submission is not connected yet. No account action was taken. This tool is intended for evidence-based reports through each platform's official moderation process.");
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-4 py-8 sm:px-6">
      <div className="bg-matte pointer-events-none fixed inset-0 z-0" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to LACZEK MD</Link>
        <section className="card-matte rounded-[28px] border border-border p-6 sm:p-8">
          <header className="mb-7 flex items-center gap-4">
            <img src="/laczek-logo.jpg" alt="LACZEK logo" className="size-14 rounded-full object-cover" />
            <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">LACZEK tools</p><h1 className="text-2xl font-bold">LaCzek Ban Bot</h1><p className="text-sm text-muted-foreground">Account safety & reporting workspace</p></div>
          </header>
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <p className="text-muted-foreground">This workspace supports reviewing evidence and preparing reports for genuine policy violations. It cannot directly ban, hack, mass-report, or disrupt accounts.</p>
          </div>
          {!unlocked ? (
            <form onSubmit={requestAccess} className="rounded-2xl border border-border bg-surface-raised p-5">
              <div className="mb-4 flex items-center gap-2 font-semibold"><KeyRound className="size-5 text-accent" /> Enter your admin-generated access key</div>
              <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter access key" autoComplete="off" className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent" />
              <button className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">Verify access key</button>
              <p className="mt-3 text-xs text-muted-foreground">Secure key verification is pending server-side storage and validation setup.</p>
            </form>
          ) : null}
          <div className="mt-7">
            <h2 className="mb-3 font-semibold">Choose a platform</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {platforms.map((p) => <button key={p.id} onClick={() => setPlatform(p.id)} className={`rounded-2xl border p-4 text-left transition ${platform === p.id ? "border-accent bg-accent/10" : "border-border bg-surface-raised hover:border-accent/50"}`}><span className="mb-2 flex size-9 items-center justify-center rounded-xl bg-background text-xl font-bold">{p.icon}</span><span className="block font-semibold">{p.name}</span><span className="mt-1 block text-xs text-muted-foreground">{p.hint}</span></button>)}
            </div>
          </div>
          <form onSubmit={submitCase} className="mt-6 space-y-4">
            <h2 className="font-semibold">Prepare a moderation report</h2>
            {platform !== "whatsapp" ? <label className="block text-sm font-medium">Account username<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" className="mt-2 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 outline-none focus:border-accent" /></label> : null}
            <label className="block text-sm font-medium">{platform === "whatsapp" ? "WhatsApp number (with country code)" : "Linked phone number (with country code)"}<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+256..." inputMode="tel" className="mt-2 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 outline-none focus:border-accent" /></label>
            <label className="block text-sm font-medium">Evidence and reason<textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Describe the specific policy violation and evidence. Do not include passwords or private login codes." className="mt-2 w-full resize-y rounded-xl border border-border bg-surface-raised px-4 py-3 outline-none focus:border-accent" /></label>
            <button type="submit" className="w-full rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 font-semibold text-foreground hover:bg-accent/15"><Search className="mr-2 inline size-4" /> Prepare report</button>
          </form>
          <p role="status" className="mt-5 rounded-xl border border-border bg-surface-raised p-3 text-xs leading-relaxed text-muted-foreground">{notice}</p>
        </section>
      </div>
    </main>
  );
}
