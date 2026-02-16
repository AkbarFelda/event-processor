const { buildContext } = require("./context");

// register commands
const help = require("../comands/help");
const ping = require("../comands/ping");
const everyone = require("../comands/everyone");
const hidetag = require("../comands/hidetag");
const sticker = require("../comands/sticker");
const remind = require("../comands/remind");

const commands = [help, ping, everyone, hidetag, sticker, remind];

async function handleIncomingMessage(sock, m) {
  const ctx = await buildContext(sock, m);

  // ✅ INI YANG WAJIB biar .help bisa list semua command
  ctx.commands = commands;

  // opsional: skip pesan kosong
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
