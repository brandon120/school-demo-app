import { getAllReports, addReport, clearAllReports } from "./reports.js";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  if (typeof res.status === "function") {
    res.status(status).json(payload);
    return;
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {Record<string, unknown> | undefined} parsedBody
 */
export async function handleReportsRequest(req, res, parsedBody) {
  if (req.method === "GET") {
    sendJson(res, 200, getAllReports());
    return null;
  }

  if (req.method === "POST") {
    const body = parsedBody ?? (await readBody(req));
    const {
      studentName,
      levelTitle,
      levelEmoji,
      mode,
      correct,
      total,
      accuracy,
      score,
      stars,
      bestStreak,
    } = body ?? {};

    if (!studentName || !levelTitle || !mode) {
      sendJson(res, 400, { error: "Missing required report fields" });
      return null;
    }

    const report = addReport({
      studentName: String(studentName).slice(0, 40),
      levelTitle: String(levelTitle),
      levelEmoji: String(levelEmoji || "📚"),
      mode: String(mode),
      correct: Number(correct),
      total: Number(total),
      accuracy: Number(accuracy),
      score: Number(score),
      stars: Number(stars),
      bestStreak: Number(bestStreak),
    });

    sendJson(res, 201, report);
    return report;
  }

  if (req.method === "DELETE") {
    clearAllReports();
    sendJson(res, 200, { ok: true });
    return { cleared: true };
  }

  sendJson(res, 405, { error: "Method not allowed" });
  return null;
}

/** Connect-style middleware for Vite dev/preview servers */
export function reportsMiddleware(req, res, next) {
  if (!req.url?.startsWith("/game-reports")) {
    return next();
  }

  handleReportsRequest(req, res).catch((err) => {
    console.error("Reports middleware error:", err);
    sendJson(res, 500, { error: "Server error" });
  });
}
