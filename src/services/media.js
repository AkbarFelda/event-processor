const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

async function getMediaBuffer(media, type) {
  const stream = await downloadContentFromMessage(media, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

module.exports = { getMediaBuffer };
