const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs");

const { handleIncomingMessage } = require("./dispatcher");

// ====== SETTINGS ======
const ANNOUNCE_GROUPS = ["120363264727998623@g.us", "120363418844376999@g.us"]; // <-- ganti/isi grup lain kalau perlu
const STATUS_FILE = "./bot_status.json";
const TZ = "Asia/Jakarta";

// ====== STATUS STORE ======
function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
  } catch {
    return { lastDisconnectAt: null };
  }
}
function writeStatus(data) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}
function formatTime(ms) {
  return new Date(ms).toLocaleString("id-ID", { timeZone: TZ });
}

// ====== SAFE SEND/BROADCAST ======
async function safeSendToGroup(sock, gid, text) {
  try {
    if (!gid || typeof gid !== "string") return false;
    if (!gid.endsWith("@g.us")) return false;

    // cek metadata dulu biar kalau jid salah/bot bukan member gak bikin crash
    await sock.groupMetadata(gid);

    await sock.sendMessage(gid, { text });
    return true;
  } catch (e) {
    console.log("[WARN] gagal kirim ke grup", gid, "-", e?.message);
    return false;
  }
}

async function safeBroadcast(sock, text) {
  for (const gid of ANNOUNCE_GROUPS) {
    await safeSendToGroup(sock, gid, text);
  }
}

// ====== MAIN ======
async function startSocket() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("[SISTEM] Scan QR:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("[SISTEM] Connected.");

      setTimeout(async () => {
        for (const gid of ANNOUNCE_GROUPS) {
          try {
            if (!gid || typeof gid !== "string") continue;
            if (!gid.endsWith("@g.us")) continue;

            await sock.sendMessage(gid, { text: "✅ Bot ONLINE!" });
          } catch (e) {
            console.log("[WARN] announce gagal ke", gid, "-", e?.message);
          }
        }
      }, 4000); // delay 4 detik
    }


    if (connection === "close") {
      // catat waktu putus (karena saat putus gak bisa kirim pesan)
      writeStatus({ lastDisconnectAt: Date.now() });

      const statusCode =
        (lastDisconnect?.error instanceof Boom)?.output?.statusCode;

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log("[SISTEM] Disconnected. statusCode:", statusCode);

      if (shouldReconnect) {
        // reconnect
        startSocket();
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
