import { useState, useEffect } from "react";
import {
  fetchReports,
  clearReports,
  subscribeToReports,
  formatReportTime,
  formatReportDate,
  getStarDisplay,
  type StudentReport,
} from "../utils/reports";
import {
  joinTeacherRoom,
  onNewReport,
  onReportsCleared,
  onSocketStatus,
  disconnectSocket,
} from "../utils/socket";

const TEACHER_USER = "teacher";
const TEACHER_PASS = "teacher";

interface TeacherPanelProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

function LoginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === TEACHER_USER && password === TEACHER_PASS) {
      onSuccess();
    } else {
      setError("Incorrect username or password.");
    }
  }

  return (
    <div className="teacher-overlay" onClick={onClose}>
      <div
        className="teacher-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Teacher login"
      >
        <button className="teacher-modal-close" onClick={onClose} type="button">
          ✕
        </button>
        <h2>Teacher Login</h2>
        <form onSubmit={handleSubmit} className="teacher-login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="teacher-login-error">{error}</p>}
          <button type="submit" className="btn-primary teacher-login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function ReportRow({ report, isNew }: { report: StudentReport; isNew: boolean }) {
  return (
    <tr className={isNew ? "report-row report-row-new" : "report-row"}>
      <td className="report-name">{report.studentName}</td>
      <td>
        <span className="report-level">
          {report.levelEmoji} {report.levelTitle}
        </span>
      </td>
      <td className="report-score">{report.correct}/{report.total}</td>
      <td className="report-accuracy">{report.accuracy}%</td>
      <td className="report-points">{report.score}</td>
      <td className="report-stars">{getStarDisplay(report.stars)}</td>
      <td className="report-time">
        {formatReportDate(report.completedAt)}
        <br />
        <span className="report-time-sub">{formatReportTime(report.completedAt)}</span>
      </td>
    </tr>
  );
}

function TeacherDashboard({ onLogout }: { onLogout: () => void }) {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [newReportIds, setNewReportIds] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      const data = await fetchReports();
      if (!cancelled) {
        setReports(data);
        setLoading(false);
      }
    }

    loadReports();

    const poll = setInterval(() => {
      fetchReports().then((data) => {
        if (!cancelled) setReports(data);
      });
    }, 3000);

    joinTeacherRoom();

    const unsubLocal = subscribeToReports(() => {
      fetchReports().then((data) => {
        if (!cancelled) setReports(data);
      });
    });

    const unsubNew = onNewReport((report) => {
      setReports((prev) => {
        if (prev.some((r) => r.id === report.id)) return prev;
        return [report, ...prev];
      });
      setNewReportIds(new Set([report.id]));
      setTimeout(() => setNewReportIds(new Set()), 3000);
    });

    const unsubClear = onReportsCleared(() => {
      setReports([]);
    });

    const unsubStatus = onSocketStatus(setConnected);

    return () => {
      cancelled = true;
      clearInterval(poll);
      unsubLocal();
      unsubNew();
      unsubClear();
      unsubStatus();
      disconnectSocket();
    };
  }, []);

  async function handleClear() {
    try {
      await clearReports();
      setReports([]);
      setShowClearConfirm(false);
    } catch {
      setReports([]);
      setShowClearConfirm(false);
    }
  }

  function handleLogout() {
    disconnectSocket();
    onLogout();
  }

  const avgAccuracy =
    reports.length > 0
      ? Math.round(
          reports.reduce((sum, r) => sum + r.accuracy, 0) / reports.length,
        )
      : 0;

  return (
    <div className="teacher-dashboard">
      <div className="teacher-dashboard-header">
        <div>
          <h2>Grade Reports</h2>
          <p className="teacher-dashboard-sub">
            Reports appear here live as students finish on any device
          </p>
        </div>
        <div className="teacher-dashboard-actions">
          <button
            type="button"
            className="btn-secondary teacher-clear-btn"
            onClick={() => setShowClearConfirm(true)}
            disabled={reports.length === 0}
          >
            Clear All
          </button>
          <button type="button" className="btn-quit teacher-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>

      <div className="teacher-summary">
        <div className="teacher-summary-stat">
          <span className="teacher-summary-value">{reports.length}</span>
          <span className="teacher-summary-label">Reports</span>
        </div>
        <div className="teacher-summary-stat">
          <span className="teacher-summary-value">{avgAccuracy}%</span>
          <span className="teacher-summary-label">Class Avg</span>
        </div>
        <div className="teacher-summary-stat teacher-live">
          <span className={`teacher-live-dot ${connected ? "" : "teacher-live-dot-off"}`} />
          <span className="teacher-summary-label">
            {connected ? "Live Updates" : "Reconnecting..."}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="teacher-empty">
          <span className="teacher-empty-icon">⏳</span>
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="teacher-empty">
          <span className="teacher-empty-icon">📋</span>
          <p>No reports yet</p>
          <p className="teacher-empty-sub">
            Student scores will show up here when they complete a level
          </p>
        </div>
      ) : (
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Level</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Points</th>
                <th>Stars</th>
                <th>Finished</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  isNew={newReportIds.has(report.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showClearConfirm && (
        <div className="teacher-overlay" onClick={() => setShowClearConfirm(false)}>
          <div
            className="teacher-modal teacher-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Clear all reports?</h3>
            <p>This will remove every student report. This cannot be undone.</p>
            <div className="teacher-confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleClear}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeacherPanel({
  isLoggedIn,
  onLogin,
  onLogout,
}: TeacherPanelProps) {
  const [showLogin, setShowLogin] = useState(false);

  if (isLoggedIn) {
    return <TeacherDashboard onLogout={onLogout} />;
  }

  return (
    <>
      <button
        type="button"
        className="teacher-login-corner"
        onClick={() => setShowLogin(true)}
      >
        👩‍🏫 Teacher Login
      </button>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            onLogin();
          }}
        />
      )}
    </>
  );
}
