function formatHelp(commands) {
  const lines = [];

  lines.push("🤖 *CheeseeyeBot Help*");
  lines.push("");

  for (const c of commands) {
    // c.usage boleh string atau array
    const usage = Array.isArray(c.usage) ? c.usage : (c.usage ? [c.usage] : []);
    const desc = c.desc || "-";

    lines.push(`*${c.name || "command"}* — ${desc}`);
    for (const u of usage) lines.push(`• ${u}`);
    lines.push("");
  }

  lines.push("Tips:");
  lines.push("• Kamu bisa reply gambar/video lalu ketik perintahnya (contoh: !sticker)");
  return lines.join("\n");
}

module.exports = {
  name: "help",
  desc: "Menampilkan daftar fitur & cara pakai",
  usage: ["!help", ".help", "!menu", ".menu"],
  match: (ctx) => /^\.((help|menu))$/i.test((ctx.text || "").trim()),
  run: async (ctx) => {
    const { sock, from, commands } = ctx;

    const list = (commands || []).filter((c) => c && c.name !== "help");
    const text = formatHelp(list);

    await sock.sendMessage(from, { text });
  },
};
