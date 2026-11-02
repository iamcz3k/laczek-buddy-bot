import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Users, KeyRound, Activity, ShieldCheck, LockKeyhole, Copy } from "lucide-react";

export const Route = createFileRoute("/adminv3")({ component: AdminV3 });

function AdminV3() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [notice, setNotice] = useState("Admin authentication, live visitor tracking, and persistent access-key management require server-side secrets and a database binding. They are not enabled in this frontend-only stage.");
  function login(e: React.FormEvent) { e.preventDefault(); setNotice("Admin login is not connected. The password must be checked on the server using a deployment secret; it is deliberately not embedded in browser code."); }
  return <main className="relative min-h-screen bg-background px-4 py-8 sm:px-6"><div className="bg-matte pointer-events-none fixed inset-0 z-0" /><div className="relative z-10 mx-auto max-w-4xl">
    <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to site</Link>
    <section className="card-matte rounded-[28px] border border-border p-6 sm:p-8">
      <header className="mb-7 flex items-center gap-4"><img src="/laczek-logo.jpg" alt="LACZEK logo" className="size-14 rounded-full object-cover" /><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-accent">Control center</p><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-sm text-muted-foreground">/adminv3 · LACZEK MD</p></div></header>
      {!authenticated ? <form onSubmit={login} className="mx-auto max-w-md rounded-2xl border border-border bg-surface-raised p-5"><div className="mb-4 flex items-center gap-2 font-semibold"><LockKeyhole className="size-5 text-accent" /> Administrator sign in</div><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Admin password" autoComplete="current-password" className="mb-3 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent" /><button className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">Sign in</button></form> : <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-surface-raised p-5"><Users className="mb-3 size-6 text-accent"/><p className="font-semibold">Live visitors</p><p className="text-sm text-muted-foreground">Waiting for analytics storage connection</p></div><div className="rounded-2xl border border-border bg-surface-raised p-5"><KeyRound className="mb-3 size-6 text-accent"/><p className="font-semibold">Access keys</p><p className="text-sm text-muted-foreground">Persistent key generation is not configured</p></div></div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">{[{icon:Users,title:"Live users",desc:"Active sessions and visitor counts"},{icon:KeyRound,title:"Key management",desc:"Generate, expire and revoke access keys"},{icon:Activity,title:"Audit activity",desc:"Review admin and report events"}].map(({icon:Icon,title,desc})=><div key={title} className="rounded-2xl border border-border p-4"><Icon className="mb-2 size-5 text-accent"/><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{desc}</p></div>)}</div>
      <p role="status" className="mt-6 rounded-xl border border-border bg-surface-raised p-4 text-xs leading-relaxed text-muted-foreground">{notice}</p>
    </section>
  </div></main>;
}
