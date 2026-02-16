const { extractText } = require("../utils/text");

async function buildContext(sock, m) {
  const from = m.key.remoteJid;
  const isGroup = from.endsWith("@g.us");
  const sender = isGroup ? m.key.participant : from;

  const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";

  const messageType = Object.keys(m.message)[0];
  const text = extractText(m.message);

  const quoted =
    m.message.extendedTextMessage?.contextInfo?.quotedMessage || null;

  const mentionedJid =
    m.message.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    [];

  const mentionedJids =
  m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []; 

  return {
    sock,
    m,
    from,
    sender,
    isGroup,
    botJid,
    messageType,
    text,
    quoted,
    mentionedJid,
    mentionedJids,
  };
}

module.exports = { buildContext };
