const { buildContext } = require("./context");
const help = require("../comands/help");
const ping = require("../comands/ping");
const everyone = require("../comands/everyone");
const hidetag = require("../comands/hidetag");
const sticker = require("../comands/sticker");
const remind = require("../comands/remind");
const ai = require("../comands/ai");

const commands = [help, ping, everyone, hidetag, sticker, remind, ai];

async function handleIncomingMessage(sock, m) {
  const ctx = await buildContext(sock, m);

  ctx.commands = commands;

  if (!ctx.text) return;

  for (const cmd of commands) {
    try {
      if (cmd.match(ctx)) {
        await cmd.run(ctx);
        return;
      }
    } catch (e) {
      console.error(`[ERROR] command ${cmd.name}:`, e?.message || e);
      await sock.sendMessage(ctx.from, { text: "Terjadi error di sistem." });
      return;
    }
  }
}

module.exports = { handleIncomingMessage };
