const fs = require("fs");

function writeTmp(path, buffer) {
  fs.writeFileSync(path, buffer);
  return path;
}

function safeUnlink(p) {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
}

module.exports = { writeTmp, safeUnlink };
