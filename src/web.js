const express = require("express");
const QRCode = require("qrcode");

function startWeb(getQr) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.get("/", (req, res) => {
    res.type("text").send("ok");
  });

  app.get("/qr", async (req, res) => {
    const qr = getQr?.();

    if (!qr) {
      res.status(404).type("text").send("QR belum tersedia. Tunggu beberapa detik lalu refresh.");
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(qr);
      res.type("html").send(`
        <html>
          <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
          <body style="font-family: sans-serif; padding: 16px;">
            <h3>Scan QR WhatsApp</h3>
            <p>Buka WhatsApp → Linked Devices → Link a device</p>
            <img src="${dataUrl}" style="max-width: 360px; width: 100%; height: auto;" />
          </body>
        </html>
      `);
    } catch (e) {
      res.status(500).type("text").send("Gagal generate QR.");
    }
  });

  app.listen(port, () => console.log("[WEB] listening on", port));
}

module.exports = { startWeb };
