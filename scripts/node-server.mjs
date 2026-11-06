import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import worker from "../dist/server/worker.js";
import { openDatabase } from "./sqlite.mjs";
const db = openDatabase(process.env.DB_PATH || ".data/bead-studio.sqlite");
const root = resolve("dist/client");
const env = {
  DB: db,
  ORDERS_ENABLED: process.env.ORDERS_ENABLED || "false",
  PAYMENT_INSTRUCTIONS: process.env.PAYMENT_INSTRUCTIONS,
  ASSETS: {
    async fetch(request) {
      const path = resolve(root, "." + new URL(request.url).pathname);
      if (!path.startsWith(root + "/"))
        return new Response("Not found", { status: 404 });
      try {
        const content = await readFile(path);
        return new Response(content, {
          headers: {
            "Content-Type":
              {
                ".js": "application/javascript",
                ".css": "text/css",
                ".svg": "image/svg+xml",
              }[extname(path)] || "application/octet-stream",
          },
        });
      } catch {
        return new Response("Not found", { status: 404 });
      }
    },
  },
};
const port = Number(process.env.PORT || 5173);
const server = createServer(async (req, res) => {
  try {
    const origin = `http://${req.headers.host}`;
    let size = 0;
    const buffers = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16384) {
        res.writeHead(413);
        res.end();
        return;
      }
      buffers.push(chunk);
    }
    const request = new Request(new URL(req.url, origin), {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : Buffer.concat(buffers),
    });
    const result = await worker.fetch(request, env);
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end("Server error");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Bead Studio H3 SSR: http://127.0.0.1:${port}`),
);
