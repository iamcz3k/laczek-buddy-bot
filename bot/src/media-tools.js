import sharp from "sharp";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

const maxBytes = Number(process.env.MAX_MEDIA_BYTES || 12 * 1024 * 1024);
function quotedMessage(message) {
  const context = message.message?.extendedTextMessage?.contextInfo
    || message.message?.imageMessage?.contextInfo
    || message.message?.videoMessage?.contextInfo;
  return context?.quotedMessage ? {
    key: { remoteJid: message.key.remoteJid, id: context.stanzaId, participant: context.participant },
    message: context.quotedMessage,
  } : null;
}
export async function handleMediaCommand({ sock, jid, message, name, logger }) {
  if (!["sticker", "toimage", "compress"].includes(name)) return false;
  const quoted = quotedMessage(message);
  const source = quoted || message;
  const hasImage = Boolean(source.message?.imageMessage || source.message?.stickerMessage);
  if (!hasImage) {
    await sock.sendMessage(jid, { text: "Reply to an image or sticker with this command." }, { quoted: message });
    return true;
  }
  try {
    const input = await downloadMediaMessage(source, "buffer", {}, { logger });
    if (!Buffer.isBuffer(input) || input.length > maxBytes) {
      await sock.sendMessage(jid, { text: "Media is too large. Maximum supported size is 12 MB." }, { quoted: message });
      return true;
    }
    if (name === "sticker") {
      const output = await sharp(input, { animated: false }).rotate().resize(512, 512, { fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      await sock.sendMessage(jid, { sticker: output }, { quoted: message });
    } else if (name === "toimage") {
      const output = await sharp(input).png().toBuffer();
      await sock.sendMessage(jid, { image: output, caption: "Converted by LACZEK MD" }, { quoted: message });
    } else {
      const output = await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 65, mozjpeg: true }).toBuffer();
      await sock.sendMessage(jid, { image: output, caption: `Compressed · ${Math.round(input.length / 1024)} KB → ${Math.round(output.length / 1024)} KB` }, { quoted: message });
    }
  } catch (error) {
    logger.error({ err: error, command: name }, "Media command failed");
    await sock.sendMessage(jid, { text: "Could not process this media. Try a supported image or a short video." }, { quoted: message });
  }
  return true;
}
