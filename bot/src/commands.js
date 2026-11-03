import { config } from "./config.js";
import { runGroupCommand } from "./group-moderation.js";
import { handleMediaCommand } from "./media-tools.js";

const commands = new Map();
function register(command) { commands.set(command.name, command); }

register({ name: "ping", description: "Check whether LACZEK MD is responding", async execute({ sock, jid }) {
  await sock.sendMessage(jid, { text: "Pong! LACZEK MD is online." });
}});
register({ name: "menu", description: "Show available commands", async execute({ sock, jid }) {
  const lines = [...commands.values()].map((command) => `• ${config.prefix}${command.name}  ${command.description}`);
  await sock.sendMessage(jid, { text: `╭━━━〔 ${config.name} 〕━━━╮\n\n${lines.join("\n")}\n\n╰━━━━━━━━━━━━━━━━╯` });
}});
register({ name: "alive", description: "Show bot uptime and runtime status", async execute({ sock, jid, startedAt }) {
  const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const uptime = [Math.floor(seconds / 86400), Math.floor((seconds % 86400) / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, "0"));
  await sock.sendMessage(jid, { text: `╭━━〔 ${config.name} 〕━━╮\nStatus: ONLINE\nUptime: ${uptime[0]}d ${uptime[1]}h ${uptime[2]}m ${uptime[3]}s\nPrefix: ${config.prefix}\n╰━━━━━━━━━━━━━━╯` });
}});

const groupDescriptions = {
  groupinfo: "Show group information", antilink: "Toggle group link protection",
  antispam: "Toggle flood and repeated-message protection", kick: "Remove a tagged member",
  promote: "Promote a tagged member", demote: "Demote a tagged member",
  warn: "Warn a tagged member", warnings: "Check a member's warnings",
  resetwarn: "Reset a member's warnings", tagall: "Mention all group members",
};
for (const [name, description] of Object.entries(groupDescriptions)) register({ name, description });
register({ name: "sticker", description: "Convert a replied image or short video into a sticker" });
register({ name: "toimage", description: "Convert a replied sticker or image to PNG" });
register({ name: "compress", description: "Compress a replied image" });

export async function handleCommand({ sock, message, startedAt, logger }) {
  const jid = message.key?.remoteJid;
  const text = message.message?.conversation
    || message.message?.extendedTextMessage?.text
    || message.message?.imageMessage?.caption
    || message.message?.videoMessage?.caption || "";
  if (!jid || message.key?.fromMe || !text.startsWith(config.prefix)) return;
  const [name, ...args] = text.slice(config.prefix.length).trim().split(/\s+/);
  const commandName = (name || "").toLowerCase();
  if (!commandName) return;

  try {
    if (await runGroupCommand({ sock, jid, message, name: commandName, args })) {
      logger.info({ command: commandName, jid }, "Group command executed");
      return;
    }
    if (await handleMediaCommand({ sock, jid, message, name: commandName, logger })) {
      logger.info({ command: commandName, jid }, "Media command executed");
      return;
    }
    const command = commands.get(commandName);
    if (!command) return;
    await command.execute({ sock, jid, args, message, startedAt });
    logger.info({ command: command.name, jid }, "Command executed");
  } catch (error) {
    logger.error({ err: error, command: commandName }, "Command failed");
    await sock.sendMessage(jid, { text: "That command failed. Check the runtime logs for details." });
  }
}

export function listCommands() {
  return [...commands.values()].map(({ name, description }) => ({ name, description }));
}
