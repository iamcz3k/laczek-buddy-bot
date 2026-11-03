import express from "express";
import cors from "cors";
import QRCode from "qrcode";
import { timingSafeEqual } from "node:crypto";
import { config } from "./config.js";
import { listCommands } from "./commands.js";
import {
  disconnectWhatsApp,
  getLatestQr,
  getWhatsAppStatus,
  requestPairingCode,
  startWhatsApp,
  stopWhatsApp,
} from "./whatsapp.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.allowedOrigins.length === 0 || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed"));
  },
}));

function authorized(req, res, next) {
  if (!config.dashboardApiKey) {
    return res.status(503).json({ error: "Dashboard API is not configured. Set DASHBOARD_API_KEY." });
  }
  const supplied = Buffer.from(req.header("x-dashboard-key") || "");
  const expected = Buffer.from(config.dashboardApiKey);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/", (_req, res) => res.json({ name: config.name, service: "whatsapp-runtime", status: "running" }));
app.get("/health", (_req, res) => res.status(200).json({ ok: true, ...getWhatsAppStatus() }));
app.get("/api/status", authorized, (_req, res) => res.json(getWhatsAppStatus()));
app.get("/api/commands", authorized, (_req, res) => res.json({ commands: listCommands() }));

app.get("/api/qr", authorized, async (_req, res) => {
  const qr = getLatestQr();
  if (!qr) return res.status(404).json({ error: "QR code is not currently available." });
  try {
    res.json({ qr, dataUrl: await QRCode.toDataURL(qr) });
  } catch {
    res.status(500).json({ error: "Could not render QR code." });
  }
});

app.post("/api/pairing-code", authorized, async (req, res) => {
  try {
    const code = await requestPairingCode(String(req.body?.phoneNumber || "").replace(/\D/g, ""));
    res.json({ pairingCode: code });
  } catch (error) {
    res.status(400).json({ error: error.message || "Could not generate pairing code." });
  }
});

app.post("/api/disconnect", authorized, async (_req, res) => {
  await disconnectWhatsApp();
  res.json({ ok: true, connection: "disconnected" });
});

const server = app.listen(config.port, config.host, () => {
  console.log(`${config.name} runtime listening on ${config.host}:${config.port}`);
  startWhatsApp().catch((error) => {
    console.error("WhatsApp startup failed:", error);
    process.exitCode = 1;
  });
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down cleanly`);
  server.close();
  await stopWhatsApp();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
