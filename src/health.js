const http = require("http");

function startHealthServer() {
  const port = process.env.PORT || 3000;
  http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
  }).listen(port, () => console.log("[HEALTH] listening on", port));
}

module.exports = { startHealthServer };
