const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".zip": "application/zip",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split("?")[0]);
  if (reqPath === "/" || reqPath === "") {
    reqPath = "/landing/index.html";
  } else if (!path.extname(reqPath) && fs.existsSync(path.join(ROOT_DIR, reqPath, "index.html"))) {
    reqPath = path.join(reqPath, "index.html");
  }

  let filePath = path.join(ROOT_DIR, reqPath);

  // Fallback to landing folder if relative path given
  if (!fs.existsSync(filePath) && fs.existsSync(path.join(ROOT_DIR, "landing", reqPath))) {
    filePath = path.join(ROOT_DIR, "landing", reqPath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Cache-Control": "no-cache"
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Echo landing page is live at: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the local server.`);
});
