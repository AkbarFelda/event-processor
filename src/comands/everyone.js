module.exports = {
  name: "everyone",
  match: (ctx) => /^!everyone\b/i.test(ctx.text) && ctx.isGroup,
  run: async (ctx) => {
    const { sock, from, botJid } = ctx;

    const md = await sock.groupMetadata(from);

    // ambil semua member kecuali bot
    let mentions = md.participants.map((p) => p.id).filter((id) => id !== botJid);

    // batas aman biar ga dianggap spam
    const MAX = 150;
    if (mentions.length > MAX) mentions = mentions.slice(0, MAX);

    const alasan = ctx.text.replace(/^!everyone\b/i, "").trim();

    let teks = "📢 [PANGGILAN GLOBAL]\n";
    if (alasan) teks += `Alasan: ${alasan}\n`;
    teks += "\n" + mentions.map((id) => `@${id.split("@")[0]}`).join(" ");

    await sock.sendMessage(from, { text: teks, mentions });
  },
};
