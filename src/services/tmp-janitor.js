const fs = require("fs");
const path = require("path");

function startTmpJanitor({ maxAgeMinutes = 30, intervalMinutes = 10 } = {}) {
  const tmpDir = path.join(process.cwd(), "tmp");

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  setInterval(() => {
    try {
      const files = fs.readdirSync(tmpDir);

      for (const file of files) {
        const filePath = path.join(tmpDir, file);
        const stat = fs.statSync(filePath);

        const age = Date.now() - stat.mtimeMs;

        if (age > maxAgeMs) {
          fs.unlinkSync(filePath);
          console.log("[TMP] Deleted:", file);
        }
      }
    } catch (e) {
      console.log("[TMP ERROR]", e.message);
    }
  }, intervalMinutes * 60 * 1000);

  console.log("[TMP] Janitor started.");
}

module.exports = { startTmpJanitor };
