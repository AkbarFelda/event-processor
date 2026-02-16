const QRCode = require("qrcode");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");

const { handleIncomingMessage } = require("./dispatcher");

async function startSocket({ onQr, onReady } = {}) {
  const authDir = process.env.AUTH_DIR || "auth_info";
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      if (typeof onQr === "function") onQr(qr);
      console.log("[SISTEM] QR ready. Buka /qr di URL Railway kamu untuk scan.");
    }

    if (connection === "open") {
      console.log("[SISTEM] Connected.");
      if (typeof onReady === "function") onReady(sock);
    }

    if (connection === "close") {
      const statusCode =
        (lastDisconnect?.error instanceof Boom)?.output?.statusCode;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log("[SISTEM] Disconnected. statusCode:", statusCode);

      if (shouldReconnect) {
        startSocket({ onQr, onReady }); // ✅ callback ikut kebawa saat reconnect
      } else {
        console.log("[SISTEM] Logged out. Hapus auth_info lalu scan ulang.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message || m.key.fromMe) return;

    try {
      await handleIncomingMessage(sock, m);
    } catch (e) {
      console.log("[ERROR] dispatcher:", e?.message || e);
    }
  });

  return sock;
}

module.exports = { startSocket };
