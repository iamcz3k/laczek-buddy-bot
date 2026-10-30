import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import { config } from "./config.js";
import { handleCommand } from "./commands.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const startedAt = Date.now();

let socket;
let connectionState = "starting";
let latestQr = null;
let latestPairingCode = null;
let reconnectTimer;
let manuallyStopped = false;

export function getWhatsAppStatus() {
  return {
    botName: config.name,
    connection: connectionState,
    connected: connectionState === "open",
    qrAvailable: Boolean(latestQr),
    pairingCodeAvailable: Boolean(latestPairingCode),
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    commandsPrefix: config.prefix,
  };
}

export function getLatestQr() {
  return latestQr;
}

export async function requestPairingCode(phoneNumber) {
  if (!socket) throw new Error("WhatsApp connection is still initializing.");
  if (connectionState === "open") throw new Error("WhatsApp is already connected.");
  if (!phoneNumber || !/^\d{8,15}$/.test(phoneNumber)) {
    throw new Error("Enter the phone number with country code, digits only.");
  }
  latestPairingCode = await socket.requestPairingCode(phoneNumber);
  return latestPairingCode;
}

export async function disconnectWhatsApp() {
  manuallyStopped = true;
  clearTimeout(reconnectTimer);
  try {
    await socket?.logout();
  } catch (error) {
    logger.warn({ err: error }, "Logout did not complete cleanly");
  }
  socket = undefined;
  connectionState = "disconnected";
  latestQr = null;
  latestPairingCode = null;
}

async function connect() {
  manuallyStopped = false;
  connectionState = "connecting";
  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);
  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch (error) {
    logger.warn({ err: error }, "Could not fetch latest WhatsApp Web version; using library default");
  }

  socket = makeWASocket({
    ...(version ? { version } : {}),
    auth: state,
    logger: logger.child({ component: "baileys" }),
    printQRInTerminal: false,
    browser: ["LACZEK MD", "Chrome", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: false,
  });

  socket.ev.on("creds.update", saveCreds);
  socket.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      latestQr = qr;
      latestPairingCode = null;
    }
    if (connection === "connecting") connectionState = "connecting";
    if (connection === "open") {
      connectionState = "open";
      latestQr = null;
      latestPairingCode = null;
      logger.info("WhatsApp connection established");
    }
    if (connection === "close") {
      connectionState = "disconnected";
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = !manuallyStopped && statusCode !== DisconnectReason.loggedOut;
      logger.warn({ statusCode, shouldReconnect }, "WhatsApp connection closed");
      if (shouldReconnect) {
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => connect().catch((error) => logger.error({ err: error }, "Reconnect failed")), 4000);
      }
    }
  });

  socket.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) {
      await handleCommand({ sock: socket, message, startedAt, logger });
    }
  });
}

export async function startWhatsApp() {
  await connect();
}

export async function stopWhatsApp() {
  manuallyStopped = true;
  clearTimeout(reconnectTimer);
  socket?.end(undefined);
  socket = undefined;
  connectionState = "stopped";
}
