import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { handleReportsRequest } from "./reports-api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, "../dist");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: true, credentials: true },
});

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.all("/game-reports", async (req, res) => {
  try {
    const result = await handleReportsRequest(req, res, req.body);
    if (result && "id" in result) {
      io.to("teachers").emit("report:new", result);
    } else if (result && "cleared" in result) {
      io.to("teachers").emit("reports:cleared");
    }
  } catch (err) {
    console.error("POST /game-reports failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process report" });
    }
  }
});

io.on("connection", (socket) => {
  socket.on("join-teacher", () => {
    socket.join("teachers");
  });
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get(/^(?!\/game-reports|\/socket\.io|\/api\/health).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
