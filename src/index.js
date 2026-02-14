const { startSocket } = require("./bot/socket");
const { startWeb } = require("./web");

let latestQr = null;

// Web server buat / dan /qr
startWeb(() => latestQr);

startSocket((qr) => {
  latestQr = qr;
}).catch((err) => console.error("[FATAL]", err));
