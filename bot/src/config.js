import "dotenv/config";
import path from "node:path";

const port = Number(process.env.PORT || 3001);
const authDir = process.env.AUTH_DIR || path.resolve("auth");

export const config = {
  name: process.env.BOT_NAME || "LACZEK MD",
  prefix: process.env.COMMAND_PREFIX || ".",
  port,
  host: process.env.HOST || "0.0.0.0",
  authDir,
  ownerNumber: (process.env.OWNER_NUMBER || "").replace(/\D/g, ""),
  dashboardApiKey: process.env.DASHBOARD_API_KEY || "",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((v) => v.trim()).filter(Boolean),
};
