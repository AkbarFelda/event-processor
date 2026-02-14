const { startSocket } = require("./bot/socket");
const { startHealthServer } = require("./health");

startHealthServer();
startSocket().catch(err => console.error("[FATAL]", err));
