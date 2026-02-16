const { startSocket } = require("./bot/socket");
const { startWeb } = require("./web");
const { startTmpJanitor } = require("./services/tmp-janitor");
const reminderStore = require("./services/reminder.store");
const reminderSched = require("./services/reminder.scheduler");

let latestQr = null;

startWeb(() => latestQr);

startTmpJanitor({ maxAgeMinutes: 30, intervalMinutes: 10 });

reminderStore.load();

startSocket({
  onQr: (qr) => (latestQr = qr),
  onReady: (sock) => reminderSched.bootSchedule(sock),
}).catch((err) => console.error("[FATAL]", err));
