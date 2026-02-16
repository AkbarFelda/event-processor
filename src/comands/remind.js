const store = require("../services/reminder.store");
const sched = require("../services/reminder.scheduler");

function parseDuration(token) {
  const m = (token || "").match(/^(\d+)(s|m|h|d)$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  const mult =
    u === "s" ? 1000 :
    u === "m" ? 60 * 1000 :
    u === "h" ? 60 * 60 * 1000 :
    24 * 60 * 60 * 1000;
  return n * mult;
}

module.exports = {
  name: "remind",
  desc: "Reminder pribadi (DM). Kalau tag orang, hanya orang itu yang diingatkan.",
  usage: [
    ".remind 10m minum air",
    ".remind 2h @orang meeting",
    ".reminders",
    ".delremind <id>",
  ],

  match: (ctx) =>
    /^\.remind\b/i.test(ctx.text || "") ||
    /^\.reminders$/i.test((ctx.text || "").trim()) ||
    /^\.delremind\b/i.test(ctx.text || ""),

  run: async (ctx) => {
    const { sock, from, text, sender, mentionedJids, isGroup } = ctx;

    // list
    if (/^\.reminders$/i.test((text || "").trim())) {
      const list = store.listByOrigin(from);
      if (!list.length) {
        await sock.sendMessage(from, { text: "Belum ada reminder di chat ini." });
        return;
      }
      const lines = list.map((r) => {
        const when = new Date(r.dueAt).toLocaleString("id-ID");
        const who = (r.targets || []).length;
        return `• ID *${r.id}* — ${when} (targets: ${who})\n  ${r.text}`;
      });
      await sock.sendMessage(from, { text: "📌 *Reminder List*\n\n" + lines.join("\n\n") });
      return;
    }

    // delete
    if (/^\.delremind\b/i.test(text || "")) {
      const parts = (text || "").trim().split(/\s+/);
      const id = parts[1];
      if (!id) {
        await sock.sendMessage(from, { text: "Format: .delremind <id>" });
        return;
      }
      const ok = store.remove(id, from);
      if (ok) {
        sched.cancel(id);
        await sock.sendMessage(from, { text: `✅ Reminder ${id} dihapus.` });
      } else {
        await sock.sendMessage(from, { text: "ID tidak ditemukan di chat ini." });
      }
      return;
    }

    // create
    const parts = (text || "").trim().split(/\s+/);
    const dur = parseDuration(parts[1]);
    const msg = parts.slice(2).join(" ").trim();

    if (!dur || !msg) {
      await sock.sendMessage(from, {
        text: "Format:\n• .remind <10m|2h|30s|1d> <pesan>\nContoh: .remind 10m minum air\n\nKalau mau target orang: tag dia.\nContoh: .remind 2h @andi meeting",
      });
      return;
    }

    // targets:
    // - kalau ada mention -> DM ke yang di-tag
    // - kalau tidak ada -> DM ke pengirim (sender)
    const targets = (mentionedJids && mentionedJids.length)
      ? mentionedJids
      : (sender ? [sender] : []);

    if (!targets.length) {
      await sock.sendMessage(from, { text: "Gagal menentukan target reminder." });
      return;
    }

    const id = Math.random().toString(36).slice(2, 8);
    const dueAt = Date.now() + dur;

    const r = {
      id,
      originChatJid: from,
      targets,
      text: msg,
      dueAt,
      createdAt: Date.now(),
    };

    store.add(r);
    sched.scheduleNew(sock, r);

    const when = new Date(dueAt).toLocaleString("id-ID");
    const targetInfo = isGroup && (mentionedJids?.length)
      ? `Target: ${mentionedJids.length} orang (via DM)`
      : `Target: pribadi (DM)`;

    await sock.sendMessage(from, {
      text: `✅ Reminder dibuat.\nID: *${id}*\nWaktu: ${when}\n${targetInfo}`,
    });
  },
};
