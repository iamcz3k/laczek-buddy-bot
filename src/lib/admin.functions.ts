import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function hmac(data: string) {
  const secret = process.env["ADMIN_SESSION_SECRET"] ?? "";
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function assertAdmin(token: string) {
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now() || (await hmac(exp)) !== sig) throw new Error("Session expired. Please sign in again.");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function randomKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = crypto.getRandomValues(new Uint8Array(12));
  const s = Array.from(b, (x) => chars[x % chars.length]).join("");
  return `CZK-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((i: { password: string }) => z.object({ password: z.string().min(1).max(200) }).parse(i))
  .handler(async ({ data }) => {
    await new Promise((r) => setTimeout(r, 300));
    if (data.password !== process.env["ADMIN_PASSWORD"]) return { ok: false as const, token: null };
    const exp = String(Date.now() + 12 * 3600_000);
    return { ok: true as const, token: `${exp}.${await hmac(exp)}` };
  });

export const getAdminDashboard = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string }) => z.object({ token: z.string().max(300) }).parse(i))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const db = await admin();
    const since = new Date(Date.now() - 60_000).toISOString();
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
    const [live, today, keys] = await Promise.all([
      db.from("visitor_sessions").select("session_id,path,user_agent,first_seen,last_seen").gte("last_seen", since).order("last_seen", { ascending: false }).limit(200),
      db.from("visitor_sessions").select("session_id", { count: "exact", head: true }).gte("last_seen", dayAgo),
      db.from("access_keys").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    if (live.error || keys.error) throw new Error("Could not load dashboard data.");
    return { live: live.data, todayCount: today.count ?? 0, keys: keys.data };
  });

export const createAccessKey = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string; label: string; days: number }) =>
    z.object({ token: z.string().max(300), label: z.string().max(80), days: z.number().int().min(0).max(365) }).parse(i))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const db = await admin();
    const expires_at = data.days > 0 ? new Date(Date.now() + data.days * 86_400_000).toISOString() : null;
    const { data: row, error } = await db.from("access_keys").insert({ key: randomKey(), label: data.label.trim(), expires_at }).select().single();
    if (error) throw new Error("Could not create key.");
    return row;
  });

export const revokeAccessKey = createServerFn({ method: "POST" })
  .inputValidator((i: { token: string; id: string }) => z.object({ token: z.string().max(300), id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const db = await admin();
    const { error } = await db.from("access_keys").update({ revoked: true }).eq("id", data.id);
    if (error) throw new Error("Could not revoke key.");
    return { ok: true };
  });

export const verifyAccessKey = createServerFn({ method: "POST" })
  .inputValidator((i: { key: string }) => z.object({ key: z.string().trim().min(1).max(64) }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("access_keys").select("id,revoked,expires_at,uses").eq("key", data.key.toUpperCase()).maybeSingle();
    if (!row || row.revoked || (row.expires_at && new Date(row.expires_at) < new Date())) return { valid: false };
    await db.from("access_keys").update({ uses: row.uses + 1, last_used_at: new Date().toISOString() }).eq("id", row.id);
    return { valid: true };
  });

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((i: { sessionId: string; path: string; ua: string }) =>
    z.object({ sessionId: z.string().regex(/^[a-zA-Z0-9-]{8,64}$/), path: z.string().max(200), ua: z.string().max(300) }).parse(i))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("visitor_sessions").upsert({ session_id: data.sessionId, path: data.path, user_agent: data.ua, last_seen: new Date().toISOString() }, { onConflict: "session_id" });
    return { ok: true };
  });
