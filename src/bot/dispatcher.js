const { buildContext } = require("./context");

// register commands
const ping = require("../comands/ping");
const everyone = require("../comands/everyone");
const hidetag = require("../comands/hidetag");
const sticker = require("../comands/sticker");
const help = require("../comands/help");
const reminder = require("../comands/reminder");
// const reminder = require("../comands/reminder");

const comands = [ping, everyone, hidetag, sticker, help, reminder];

async function handleIncomingMessage(sock, m) {
  const ctx = await buildContext(sock, m);
  if (!ctx.text) return; 

  if (ctx.isGroup) {
    console.log("GROUP JID:", ctx.from);
  }

  console.log("==========");
  console.log("FROM (Chat JID):", ctx.from);
  console.log("SENDER:", ctx.sender);
  console.log("IS GROUP:", ctx.isGroup);
  console.log("TEXT:", ctx.text);
  console.log("==========");

  for (const cmd of comands) {
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
