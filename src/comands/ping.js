module.exports = {
  name: "ping",
  desc: "Cek bot aktif atau tidak",
  usage: [".ping"],
  match: (ctx) => /^\.ping$/i.test((ctx.text || "").trim()),
  run: async (ctx) => {
    await ctx.sock.sendMessage(ctx.from, { text: "Pong! ✅" });
  },
};
