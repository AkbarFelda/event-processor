const store = require("./reminder.store");
const timers = new Map();

function scheduleOne(sock, r) {
  const delay = Math.max(0, r.dueAt - Date.now());

  const t = setTimeout(async () => {
    timers.delete(r.id);

    try {
      const msg = `⏰ *Reminder*\n${r.text}`;

      // kirim ke semua target (DM)
      for (const jid of r.targets || []) {
        try {
          await sock.sendMessage(jid, { text: msg });
        } catch (e) {
          console.log("[REMINDER DM FAIL]", jid, e?.message);
        }
      }
    } finally {
      store.remove(r.id, r.originChatJid);
    }
  }, delay);

  timers.set(r.id, t);
}

function bootSchedule(sock) {
  for (const r of store.all()) {
    if (r.dueAt < Date.now() - 24 * 60 * 60 * 1000) {
      store.remove(r.id, r.originChatJid);
      continue;
    }
    scheduleOne(sock, r);
  }
}

function scheduleNew(sock, r) {
  scheduleOne(sock, r);
}

function cancel(id) {
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
}

module.exports = { bootSchedule, scheduleNew, cancel };
