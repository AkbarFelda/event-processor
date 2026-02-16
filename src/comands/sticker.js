const fs = require("fs");
const os = require("os");
const path = require("path");

const { getMediaBuffer } = require("../services/media");
const { toSticker } = require("../services/sticker.service");
const { safeUnlink } = require("../utils/files");

const TMP_DIR = process.env.TMP_DIR || os.tmpdir(); // Railway: /tmp

function parseSeconds(text) {
  const m = (text || "").match(/^\.(sticker|stiker)\s+(\d+)/i);
  if (!m) return 5;
  const n = parseInt(m[2], 10);
  if (Number.isNaN(n)) return 5;
  return Math.max(1, Math.min(n, 10));
}

module.exports = {
  name: "sticker",
  desc: "Bikin sticker dari gambar/video (reply juga bisa).",
  usage: [".sticker", ".sticker 3", ".sticker 5"],
  match: (ctx) => /^\.(sticker|stiker)\b/i.test(ctx.text || ""),
  run: async (ctx) => {
    const { sock, from, m, messageType, quoted } = ctx;

    const isImage = messageType === "imageMessage";
    const isVideo = messageType === "videoMessage";
    const isQuotedImage = !!quoted?.imageMessage;
    const isQuotedVideo = !!quoted?.videoMessage;

    if (!(isImage || isVideo || isQuotedImage || isQuotedVideo)) {
      await sock.sendMessage(from, { text: "Reply/kirim gambar atau video lalu ketik .sticker (opsional: .sticker 3 / 5)" });
      return;
    }

    const isVideoContent = isVideo || isQuotedVideo;
    const media =
      isImage ? m.message.imageMessage :
      isVideo ? m.message.videoMessage :
      isQuotedImage ? quoted.imageMessage :
      quoted.videoMessage;

    const seconds = isVideoContent ? parseSeconds(ctx.text) : 0;

    const id = Date.now();
    const inputPath = path.join(TMP_DIR, `wa_${id}.${isVideoContent ? "mp4" : "jpg"}`);
    const outputPath = path.join(TMP_DIR, `wa_${id}.webp`);

    try {
      const buf = await getMediaBuffer(media, isVideoContent ? "video" : "image");
      fs.writeFileSync(inputPath, buf);

      await toSticker({ inputPath, outputPath, isVideo: isVideoContent, seconds });

      await sock.sendMessage(from, { sticker: fs.readFileSync(outputPath) });
    } catch (e) {
      console.log("[STICKER ERROR]", e?.message || e);
      await sock.sendMessage(from, { text: "Gagal bikin sticker 😢" });
    } finally {
      safeUnlink(inputPath);
      safeUnlink(outputPath);
    }
  },
};
