const { askAI } = require("../services/ai.service");

module.exports = {
  name: "ai",
  desc: "Tanya AI",
  usage: [".ai <pertanyaan>"],
  match: (ctx) => /^\.ai\s+/i.test(ctx.text || ""),
  run: async (ctx) => {
    const { sock, from, text } = ctx;

    const prompt = text.replace(/^\.ai\s+/i, "").trim();

    if (!prompt) {
      await sock.sendMessage(from, { text: "Contoh: .ai jelasin blockchain" });
      return;
    }

    await sock.sendMessage(from, { text: "🤖 Sedang berpikir..." });

    try {
      const answer = await askAI(prompt);
      await sock.sendMessage(from, { text: answer.slice(0, 4000) });
    } catch (e) {
      console.log("[AI ERROR]", e?.message);
      await sock.sendMessage(from, { text: "AI sedang sibuk 😢" });
    }
  }
};
