module.exports = {
  name: "everyone",
  desc: "Mention semua anggota grup (terlihat @user di teks)",
  usage: [".everyone", ".everyone <alasan>"],
  match: (ctx) => ctx.isGroup && /^\.everyone\b/i.test(ctx.text || ""),
  run: async (ctx) => {
    const { sock, from, botJid } = ctx;

    const md = await sock.groupMetadata(from);
    let mentions = md.participants.map((p) => p.id).filter((id) => id !== botJid);

    const alasan = (ctx.text || "").replace(/^\.everyone\b/i, "").trim();

    let text = "📢 *PANGGILAN GLOBAL*\n";
    if (alasan) text += `Alasan: ${alasan}\n\n`;
    text += mentions.map((id) => `@${id.split("@")[0]}`).join(" ");

    await sock.sendMessage(from, { text, mentions });
  },
};
