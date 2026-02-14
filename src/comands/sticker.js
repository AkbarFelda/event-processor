const { getMediaBuffer } = require("../services/media");
const { toSticker } = require("../services/sticker.service");
const { writeTmp, safeUnlink } = require("../utils/files");



function parseSeconds(text) {
  const m = text.match(/^!(sticker|stiker)(?:\s+(\d+))?/i);
  const sec = m?.[2] ? parseInt(m[2], 10) : 3;
  return [3, 5].includes(sec) ? sec : 3;
}

module.exports = {
  name: "sticker",
  match: (ctx) => /^!(sticker|stiker)\b/i.test(ctx.text),
  run: async (ctx) => {
    const { sock, from, messageType, m, quoted } = ctx;

    const seconds = parseSeconds(ctx.text);

    const isImage = messageType === "imageMessage";
    const isVideo = messageType === "videoMessage";
    const isQuotedImage = !!quoted?.imageMessage;
    const isQuotedVideo = !!quoted?.videoMessage;

    if (!(isImage || isVideo || isQuotedImage || isQuotedVideo)) {
      await sock.sendMessage(from, { text: "Kirim/reply gambar atau video lalu ketik !sticker 3 / !sticker 5" });
      return;
    }

    const isVideoContent = isVideo || isQuotedVideo;
    const media =
      isImage ? m.message.imageMessage :
      isVideo ? m.message.videoMessage :
      isQuotedImage ? quoted.imageMessage :
      quoted.videoMessage;

    const buffer = await getMediaBuffer(media, isVideoContent ? "video" : "image");
    const id = Date.now();
    const inputPath = writeTmp(`tmp_${id}.${isVideoContent ? "mp4" : "jpg"}`, buffer);
    const outputPath = `./tmp_${id}.webp`;

    await sock.sendMessage(from, { text: "⏳ Membuat sticker..." });

    await toSticker({ inputPath, outputPath, isVideo: isVideoContent, seconds });

    await sock.sendMessage(from, { sticker: require("fs").readFileSync(outputPath) });

    // cleanup
    const { safeUnlink } = require("../utils/files");
    safeUnlink(inputPath);
    safeUnlink(outputPath);
  },
};
