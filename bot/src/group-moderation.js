import fs from "node:fs/promises";
import path from "node:path";

const dataDir = process.env.DATA_DIR || "./data";
const settingsPath = path.join(dataDir, "groups.json");
const warningsPath = path.join(dataDir, "warnings.json");
const recentMessages = new Map();
const linkPattern = /(?:https?:\/\/|www\.|chat\.whatsapp\.com\/|t\.me\/|discord\.gg\/)[^\s]+/i;

async function readJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch (error) { if (error.code !== "ENOENT") console.error("Group data read failed:", error); return fallback; }
}
async function writeJson(file, value) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(value, null, 2), { mode: 0o600 });
}
export async function getGroupSettings(jid) {
  const all = await readJson(settingsPath, {});
  return all[jid] || { antiLink: false, antiSpam: false, warnLimit: 3 };
}
export async function setGroupSetting(jid, key, value) {
  const all = await readJson(settingsPath, {});
  all[jid] = { antiLink: false, antiSpam: false, warnLimit: 3, ...(all[jid] || {}), [key]: value };
  await writeJson(settingsPath, all);
  return all[jid];
}
export function getParticipantId(message) {
  return message.key?.participant || message.key?.participantPn || message.key?.remoteJid;
}
export async function getGroupContext(sock, jid, message) {
  const metadata = await sock.groupMetadata(jid);
  const sender = getParticipantId(message);
  const botId = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  const participants = metadata.participants || [];
  const senderEntry = participants.find((p) => p.id === sender || p.phoneNumber === sender);
  const botEntry = participants.find((p) => p.id === botId || p.id?.split(":")[0] === sock.user?.id?.split(":")[0]);
  return {
    metadata, sender, participants,
    isSenderAdmin: Boolean(senderEntry?.admin),
    isBotAdmin: Boolean(botEntry?.admin),
    admins: participants.filter((p) => p.admin).map((p) => p.id),
  };
}
export async function requireGroupAdmin(sock, jid, message) {
  const ctx = await getGroupContext(sock, jid, message);
  if (!ctx.isSenderAdmin) {
    await sock.sendMessage(jid, { text: "This command is for group admins only." }, { quoted: message });
    return null;
  }
  if (!ctx.isBotAdmin) {
    await sock.sendMessage(jid, { text: "Make LACZEK MD a group admin first so it can manage members." }, { quoted: message });
    return null;
  }
  return ctx;
}
async function addWarning(jid, user) {
  const all = await readJson(warningsPath, {});
  const key = jid + ":" + user;
  all[key] = (all[key] || 0) + 1;
  await writeJson(warningsPath, all);
  return all[key];
}
export async function handleGroupModeration({ sock, message, logger }) {
  const jid = message.key?.remoteJid;
  if (!jid?.endsWith("@g.us") || message.key?.fromMe) return;
  const ctx = await getGroupContext(sock, jid, message).catch((error) => {
    logger.warn({ err: error, jid }, "Could not read group metadata");
    return null;
  });
  if (!ctx) return;
  const body = message.message?.conversation
    || message.message?.extendedTextMessage?.text
    || message.message?.imageMessage?.caption
    || message.message?.videoMessage?.caption || "";
  const settings = await getGroupSettings(jid);
  const sender = ctx.sender;

  if (settings.antiLink && !ctx.isSenderAdmin && linkPattern.test(body)) {
    if (ctx.isBotAdmin) {
      await sock.sendMessage(jid, { delete: message.key });
      const count = await addWarning(jid, sender);
      await sock.sendMessage(jid, { text: `⚠️ @${sender.split("@")[0]}: links are disabled in this group. Warning ${count}/${settings.warnLimit}.`, mentions: [sender] });
      if (count >= settings.warnLimit) {
        await sock.groupParticipantsUpdate(jid, [sender], "remove");
        await sock.sendMessage(jid, { text: `Member removed after reaching ${settings.warnLimit} warnings.` });
      }
    } else {
      await sock.sendMessage(jid, { text: "Link detected. Make LACZEK MD an admin to enable automatic moderation." });
    }
    return;
  }

  if (settings.antiSpam && !ctx.isSenderAdmin && body.trim()) {
    const now = Date.now();
    const previous = recentMessages.get(jid + ":" + sender) || [];
    const recent = previous.filter((entry) => now - entry.time < 7000);
    recent.push({ text: body.trim().toLowerCase(), time: now });
    recentMessages.set(jid + ":" + sender, recent);
    const duplicates = recent.filter((entry) => entry.text === body.trim().toLowerCase()).length;
    if (recent.length >= 6 || duplicates >= 4) {
      if (ctx.isBotAdmin) {
        await sock.sendMessage(jid, { delete: message.key });
        const count = await addWarning(jid, sender);
        await sock.sendMessage(jid, { text: `Anti-spam: @${sender.split("@")[0]}, slow down. Warning ${count}/${settings.warnLimit}.`, mentions: [sender] });
        if (count >= settings.warnLimit) await sock.groupParticipantsUpdate(jid, [sender], "remove");
      }
      recentMessages.set(jid + ":" + sender, []);
    }
  }
}
export async function runGroupCommand({ sock, jid, message, name, args }) {
  const groupCommands = new Set(["groupinfo", "antilink", "antispam", "kick", "promote", "demote", "warn", "warnings", "resetwarn", "tagall"]);
  if (!groupCommands.has(name)) return false;
  if (!jid.endsWith("@g.us")) {
    await sock.sendMessage(jid, { text: "This command only works inside a group." }, { quoted: message });
    return true;
  }
  const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (name === "groupinfo") {
    const { metadata, participants, admins } = await getGroupContext(sock, jid, message);
    await sock.sendMessage(jid, { text: `╭━━〔 GROUP INFO 〕━━╮\nName: ${metadata.subject}\nMembers: ${participants.length}\nAdmins: ${admins.length}\n╰━━━━━━━━━━━━━━╯` }, { quoted: message });
    return true;
  }
  if (name === "antilink" || name === "antispam") {
    const ctx = await requireGroupAdmin(sock, jid, message); if (!ctx) return true;
    const value = (args[0] || "").toLowerCase();
    if (!["on", "off"].includes(value)) {
      await sock.sendMessage(jid, { text: `Usage: .${name} on/off` }, { quoted: message }); return true;
    }
    const key = name === "antilink" ? "antiLink" : "antiSpam";
    const updated = await setGroupSetting(jid, key, value === "on");
    await sock.sendMessage(jid, { text: `${name} is now ${updated[key] ? "ON" : "OFF"}.` }, { quoted: message });
    return true;
  }
  if (["kick", "promote", "demote", "warn", "warnings", "resetwarn"].includes(name)) {
    const ctx = await requireGroupAdmin(sock, jid, message); if (!ctx) return true;
    if (!target) { await sock.sendMessage(jid, { text: `Tag or reply to a member. Usage: .${name} @user` }, { quoted: message }); return true; }
    if (ctx.admins.includes(target)) { await sock.sendMessage(jid, { text: "This action cannot target a group admin." }, { quoted: message }); return true; }
    if (name === "kick" || name === "promote" || name === "demote") {
      const action = name === "kick" ? "remove" : name;
      await sock.groupParticipantsUpdate(jid, [target], action);
      await sock.sendMessage(jid, { text: `Member ${name} action completed for @${target.split("@")[0]}.`, mentions: [target] });
      return true;
    }
    const all = await readJson(warningsPath, {});
    const key = jid + ":" + target;
    if (name === "resetwarn") { delete all[key]; await writeJson(warningsPath, all); await sock.sendMessage(jid, { text: "Warnings reset." }); return true; }
    if (name === "warn") { const count = await addWarning(jid, target); await sock.sendMessage(jid, { text: `Warning ${count}/3 issued to @${target.split("@")[0]}.`, mentions: [target] }); return true; }
    await sock.sendMessage(jid, { text: `@ ${target.split("@")[0]} has ${all[key] || 0} warning(s). `, mentions: [target] }); return true;
  }
  if (name === "tagall") {
    const ctx = await requireGroupAdmin(sock, jid, message); if (!ctx) return true;
    const mentions = ctx.participants.map((p) => p.id);
    const text = args.join(" ") || "Attention everyone";
    await sock.sendMessage(jid, { text: `📢 ${text}\n\n${mentions.map((id) => "@" + id.split("@")[0]).join(" ")}`, mentions });
    return true;
  }
  return false;
}
