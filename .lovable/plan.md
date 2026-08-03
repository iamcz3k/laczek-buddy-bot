## What I found

Your site `jawadtech.vercel.app` is a single-page WhatsApp pairing-code generator:

- Header: lightning-bolt logo orb, "JAWAD-MD", subtitle "Generate Your Pairing Code"
- "Select Server" bar showing Active / Limit x/50, opening a grid of 100 servers (Server 1–100)
- "Quick Setup" info card
- WhatsApp Number input (with country-code hint), "Generate Pair Code" button, loading state
- Pairing-code result box + Copy Code button, toast notifications, 30-second cooldown
- Purple/violet dark theme (#0a0a0f, glowing gradient orbs, glass card), Poppins font, Font Awesome icons

Backend: all calls go to a hidden `POST /x` endpoint with `{a: "status"|"gen", b: ...}`.

I verified it directly:
- `POST /x {"a":"status","b":"server1"}` returns `{"count":49,"limit":50}`
- It rejects requests with a foreign Origin (`403 {"e":"access denied"}`) but accepts them when the request carries `Origin`/`Referer` of `https://jawadtech.vercel.app`
- There are no CORS headers, so the browser cannot call it directly

So LACZEK MD must proxy through its own server: browser → our server function → `jawadtech.vercel.app/x` with the required headers. Jawad stays the real backend; LACZEK MD is pure frontend.

## Plan

1. **Server proxy** — `src/lib/pair.functions.ts` with two server functions:
   - `getServerStatus({ server })` → forwards `{a:"status", b:server}`
   - `generatePairCode({ server, number })` → forwards `{a:"gen", b:{server, number}}` and returns the code
   Both POST to `https://jawadtech.vercel.app/x` with `Origin`/`Referer` set to `https://jawadtech.vercel.app`, and relay the upstream error message (`e`) back as a clean error. Input validated (digits-only number, 8–15 chars; server id from the known list).

2. **Rebuild the page at `/`** (`src/routes/index.tsx`) — same layout, same sections, same copy, same interaction flow and 30s cooldown as JAWAD-MD, mobile-first (the reference is mobile-sized). Components split out: `ServerPicker`, `QuickSetupCard`, `PairForm`, `CodeBox`, toast via sonner.

3. **Matte black theme** — replace the purple design tokens in `src/styles.css` with a matte-black system: near-black surfaces (no gloss, muted flat blacks), soft graphite borders, white/neutral text, and a restrained monochrome accent for the button, logo orb and active states. The floating purple glow orbs become subtle dark-graphite haze so the page reads matte rather than glossy. All values as semantic tokens (no hardcoded colors in components).

4. **Branding** — "LACZEK MD" title, subtitle "Generate Your Pairing Code", lightning-bolt mark in a matte-black orb, footer "© 2026 LACZEK MD".

5. **SEO/head** — route `head()` on `/` with LACZEK MD title/description/og/twitter.

## Technical notes

- Proxy lives in a server function (not a public API route) so the upstream endpoint and header spoofing stay server-side and are never visible in the browser — matching the "no API visible" behaviour of the original.
- Server list is hardcoded 1–100 exactly as the original; status is fetched on selection.
- If Jawad's backend later blocks the proxy or changes the `/x` contract, LACZEK MD stops working — it has no independent backend by design, per your request.
- No database or auth needed, so no Cloud backend.
