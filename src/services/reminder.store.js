const fs = require("fs");
const FILE = process.env.REMINDER_FILE || "";

let reminders = []; 
// { id, originChatJid, targets:[], text, dueAt, createdAt }

function load() {
  if (!FILE) return;
  try {
    reminders = JSON.parse(fs.readFileSync(FILE, "utf8")) || [];
  } catch {
    reminders = [];
  }
}

function save() {
  if (!FILE) return;
  try {
    fs.writeFileSync(FILE, JSON.stringify(reminders, null, 2));
  } catch {}
}

function add(r) { reminders.push(r); save(); }
function all() { return reminders.slice(); }

function listByOrigin(originChatJid) {
  return reminders
    .filter(r => r.originChatJid === originChatJid)
    .sort((a, b) => a.dueAt - b.dueAt);
}

function remove(id, originChatJid) {
  const before = reminders.length;
  reminders = reminders.filter(r => !(r.id === id && r.originChatJid === originChatJid));
  const ok = reminders.length !== before;
  if (ok) save();
  return ok;
}

module.exports = { load, save, add, all, listByOrigin, remove };
