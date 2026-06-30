/** @typedef {Object} ReportRecord
 * @property {string} id
 * @property {string} studentName
 * @property {string} levelTitle
 * @property {string} levelEmoji
 * @property {string} mode
 * @property {number} correct
 * @property {number} total
 * @property {number} accuracy
 * @property {number} score
 * @property {number} stars
 * @property {number} bestStreak
 * @property {string} completedAt
 */

/** @type {ReportRecord[]} */
let reports = [];

export function getAllReports() {
  return [...reports].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

/** @param {Omit<ReportRecord, "id" | "completedAt">} data */
export function addReport(data) {
  const report = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    studentName: data.studentName,
    levelTitle: data.levelTitle,
    levelEmoji: data.levelEmoji,
    mode: data.mode,
    correct: data.correct,
    total: data.total,
    accuracy: data.accuracy,
    score: data.score,
    stars: data.stars,
    bestStreak: data.bestStreak,
    completedAt: new Date().toISOString(),
  };

  reports.unshift(report);
  return report;
}

export function clearAllReports() {
  reports = [];
}
