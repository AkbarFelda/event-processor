const fs = require("fs");
const PATH = "./bot_status.json";

function readStatus() {
  try { return JSON.parse(fs.readFileSync(PATH, "utf8")); }
  catch { return { lastDisconnectAt: null }; }
}

function writeStatus(data) {
  fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
}

module.exports = { readStatus, writeStatus };
