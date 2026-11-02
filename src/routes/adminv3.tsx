import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Users, KeyRound, LockKeyhole, Copy, LogOut, RefreshCw, Ban, Activity, Play, Pause } from "lucide-react";
import { toast } from "sonner";

import { adminLogin, createAccessKey, getAdminDashboard, revokeAccessKey } from "@/lib/admin.functions";

export const Route = createFileRoute("/adminv3")({
  head: () => ({
    meta: [
      { title: "Admin Panel — LACZEK MD" },
      { name: "description", content: "LACZEK MD admin panel for live visitors and access keys." },
      { property: "og:title", content: "Admin Panel — LACZEK MD" },
      { property: "og:description", content: "LACZEK MD admin panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminV3,
});

type Dash = Awaited<ReturnType<typeof getAdminDashboard>>;

function ago(iso: string) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : `${Math.round(s / 3600)}h ago`;
}

function device(ua: string) {
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad/i.test(ua)) return "iPhone/iPad";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function AdminV3() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [dash, setDash] = useState<Dash | null>(null);
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(7);
  const [monitoring, setMonitoring] = useState(true);

  useEffect(() => { setToken(sessionStorage.getItem("lz-admin")); }, []);

  const logout = useCallback(() => { sessionStorage.removeItem("lz-admin"); setToken(null); setDash(null); }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try { setDash(await getAdminDashboard({ data: { token } })); }
    catch (e) { toast.error((e as Error).message); logout(); }
  }, [token, logout]);

  useEffect(() => {
    if (!token || !monitoring) return;
    load();
    const t = setInterval(load, 5_000);
    return () => clearInterval(t);
  }, [token, load, monitoring]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const r = await adminLogin({ data: { password } });
      if (!r.ok || !r.token) { toast.error("Wrong password"); return; }
      sessionStorage.setItem("lz-admin", r.token); setToken(r.token); setPassword("");
    } finally { setBusy(false); }
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault(); if (!token) return; setBusy(true);
    try {
      const row = await createAccessKey({ data: { token, label, days } });
      await navigator.clipboard?.writeText(row.key).catch(() => {});
      toast.success(`Key ${row.key} created and copied`); setLabel(""); load();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    if (!token) return;
    try { await revokeAccessKey({ data: { token, id } }); toast.success("Key revoked"); load(); }
    catch (err) { toast.error((err as Error).message); }
  }

  const status = (k: Dash["keys"][number]) =>
    k.revoked ? "Revoked" : k.expires_at && new Date(k.expires_at) < new Date() ? "Expired" : "Active";

  // These entries are derived only from persisted visitor-session and access-key records.
  const logs = dash ? [
    ...dash.live.map((v) => ({ id: `visit-${v.session_id}`, at: v.last_seen, kind: "접속", message: `웹사이트 방문 기록 · ${v.path}`, detail: device(v.user_agent) })),
    ...dash.keys.flatMap((k) => [
      ...(k.created_at ? [{ id: `created-${k.id}`, at: k.created_at, kind: "열쇠", message: "접근 열쇠 생성", detail: k.label || "이름 없음" }] : []),
      ...(k.last_used_at ? [{ id: `used-${k.id}`, at: k.last_used_at, kind: "사용", message: "접근 열쇠 사용", detail: `${k.uses}회 사용` }] : []),
    ]),
  ].filter((entry) => Boolean(entry.at)).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 40) : [];

  return <main className="relative min-h-screen bg-background px-4 py-8 sm:px-6"><div className="bg-matte pointer-events-none fixed inset-0 z-0" /><div className="relative z-10 mx-auto max-w-4xl">
    <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to site</Link>
    <section className="card-matte rounded-[28px] border border-border p-6 sm:p-8">
      <header className="mb-7 flex items-center gap-4"><img src="/laczek-logo.jpg" alt="LACZEK logo" className="size-14 rounded-full object-cover" /><div className="flex-1"><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Control center</p><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-sm text-muted-foreground">LACZEK MD</p></div>
        {token ? <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><LogOut className="size-4" /> Sign out</button> : null}
      </header>

      {!token ? <form onSubmit={login} className="mx-auto max-w-md rounded-2xl border border-border bg-surface-raised p-5"><div className="mb-4 flex items-center gap-2 font-semibold"><LockKeyhole className="size-5 text-accent" /> Administrator sign in</div><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Admin password" autoComplete="current-password" className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent" /><button disabled={busy} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Checking…" : "Sign in"}</button></form> : <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat icon={Users} label="Online now" value={dash?.live.length ?? "…"} />
          <Stat icon={Users} label="Visitors (24h)" value={dash?.todayCount ?? "…"} />
          <Stat icon={KeyRound} label="Active keys" value={dash ? dash.keys.filter((k) => status(k) === "Active").length : "…"} />
        </div>

        <div className="rounded-2xl border border-border bg-surface-raised p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Users on the website now</h2><button onClick={load} aria-label="Refresh" className="text-muted-foreground hover:text-foreground"><RefreshCw className="size-4" /></button></div>
          {dash && dash.live.length === 0 ? <p className="text-sm text-muted-foreground">Nobody online right now.</p> : null}
          <ul className="divide-y divide-border">{dash?.live.map((v) => <li key={v.session_id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" />{device(v.user_agent)} · <span className="font-mono text-muted-foreground">{v.path}</span></span><span className="text-xs text-muted-foreground">joined {ago(v.first_seen)} · seen {ago(v.last_seen)}</span></li>)}</ul>
        </div>

        <section className="rounded-2xl border border-border bg-surface-raised p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Activity className="size-5 text-accent" /><div><h2 className="font-semibold">실시간 보안 기록</h2><p className="text-xs text-muted-foreground">저장된 방문 및 접근 열쇠 기록 · 5초마다 갱신</p></div></div>
            <button type="button" onClick={() => setMonitoring((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:border-accent">
              {monitoring ? <Pause className="size-4" /> : <Play className="size-4" />}{monitoring ? "중지" : "시작"}
            </button>
          </div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><span className={`size-2 rounded-full ${monitoring ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />{monitoring ? "실시간 감시 실행 중" : "감시 일시 중지"}</div>
          {logs.length === 0 ? <p className="text-sm text-muted-foreground">아직 기록된 활동이 없습니다.</p> : <ul className="max-h-[420px] space-y-2 overflow-y-auto font-mono text-xs">{logs.map((entry) => <li key={entry.id} className="rounded-xl border border-border/70 bg-background/70 p-3"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><span className="text-accent">[{entry.kind}] {entry.message}</span><time className="text-muted-foreground">{new Date(entry.at).toLocaleString("ko-KP")}</time></div><p className="break-all text-muted-foreground">{entry.detail}</p></li>)}</ul>}
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">이 기록은 실제 데이터베이스에 저장된 방문 세션과 접근 열쇠 활동만 표시합니다. 저장되지 않은 사건이나 외부 계정의 활동은 표시하지 않습니다.</p>
        </section>

        <form onSubmit={generate} className="rounded-2xl border border-border bg-surface-raised p-5">
          <h2 className="mb-3 font-semibold">Generate access key</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
            <input value={label} onChange={(e)=>setLabel(e.target.value)} maxLength={80} placeholder="Who is it for? (optional)" className="rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent" />
            <select value={days} onChange={(e)=>setDays(Number(e.target.value))} className="rounded-xl border border-border bg-background px-3 py-3 outline-none focus:border-accent">
              <option value={1}>1 day</option><option value={7}>7 days</option><option value={30}>30 days</option><option value={0}>Never expires</option>
            </select>
            <button disabled={busy} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-60">Generate</button>
          </div>
        </form>

        <div className="rounded-2xl border border-border bg-surface-raised p-5">
          <h2 className="mb-3 font-semibold">Access keys</h2>
          {dash && dash.keys.length === 0 ? <p className="text-sm text-muted-foreground">No keys yet.</p> : null}
          <ul className="divide-y divide-border">{dash?.keys.map((k) => { const st = status(k); return <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div><button onClick={() => { navigator.clipboard?.writeText(k.key); toast.success("Copied"); }} className="inline-flex items-center gap-2 font-mono font-semibold"><Copy className="size-3.5 text-muted-foreground" />{k.key}</button>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.label || "No label"} · used {k.uses}× · {k.expires_at ? `expires ${new Date(k.expires_at).toLocaleDateString()}` : "never expires"}</p></div>
            <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-0.5 text-xs ${st === "Active" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{st}</span>
              {st === "Active" ? <button onClick={() => revoke(k.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs hover:border-destructive hover:text-destructive"><Ban className="size-3" /> Revoke</button> : null}</div>
          </li>; })}</ul>
        </div>
      </div>}
    </section>
  </div></main>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return <div className="rounded-2xl border border-border bg-surface-raised p-4"><Icon className="mb-2 size-5 text-accent" /><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
