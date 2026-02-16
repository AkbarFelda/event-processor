module.exports = {
  name: "hidetag",
  desc: "Mention semua anggota grup tapi tanpa nampilin list @user",
  usage: [".hidetag <pesan>", ".hidetag"],
  match: (ctx) => ctx.isGroup && /^\.hidetag\b/i.test(ctx.text || ""),
  run: async (ctx) => {
    const { sock, from, botJid } = ctx;

    const md = await sock.groupMetadata(from);
    let mentions = md.participants.map((p) => p.id).filter((id) => id !== botJid);

    const msg = (ctx.text || "").replace(/^\.hidetag\b/i, "").trim();

    const text = msg
      ? `📢 ${msg}`
      : "📢 *Hidetag*";

    await sock.sendMessage(from, { text, mentions });
  },
};
