module.exports = {
  name: "ping",
  match: (ctx) => /^!ping$/i.test(ctx.text),
  run: async (ctx) => {
    await ctx.sock.sendMessage(ctx.from, { text: "Status: Aktif." });
  },
};
