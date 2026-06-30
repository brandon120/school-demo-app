import type { GameMode } from "../types";

export interface StudentReport {
  id: string;
  studentName: string;
  levelTitle: string;
  levelEmoji: string;
  mode: GameMode;
  correct: number;
  total: number;
  accuracy: number;
  score: number;
  stars: number;
  bestStreak: number;
  completedAt: string;
}

export type ReportInput = Omit<StudentReport, "id" | "completedAt">;

const STORAGE_KEY = "addition-adventure-reports";
const REPORTS_URL = "/game-reports";

function getLocalReports(): StudentReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudentReport[];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: StudentReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  window.dispatchEvent(new Event("reports-updated"));
}

function mergeReports(server: StudentReport[], local: StudentReport[]): StudentReport[] {
  const map = new Map<string, StudentReport>();
  for (const report of [...local, ...server]) {
    map.set(report.id, report);
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function fetchReports(): Promise<StudentReport[]> {
  const local = getLocalReports();

  try {
    const server = await apiFetch(REPORTS_URL);
    const merged = mergeReports(server as StudentReport[], local);
    saveLocalReports(merged);
    return merged;
  } catch {
    return local;
  }
}

export async function saveReport(data: ReportInput): Promise<StudentReport> {
  const report: StudentReport = {
    ...data,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    completedAt: new Date().toISOString(),
  };

  const local = getLocalReports();
  saveLocalReports([report, ...local.filter((r) => r.id !== report.id)]);

  try {
    const saved = (await apiFetch(REPORTS_URL, {
      method: "POST",
      body: JSON.stringify(data),
    })) as StudentReport;

    const updated = getLocalReports().map((r) =>
      r.id === report.id ? saved : r,
    );
    if (!updated.some((r) => r.id === saved.id)) {
      updated.unshift(saved);
    }
    saveLocalReports(updated);
    return saved;
  } catch {
    return report;
  }
}

export async function clearReports(): Promise<void> {
  saveLocalReports([]);

  try {
    await apiFetch(REPORTS_URL, { method: "DELETE" });
  } catch {
    // Local clear still succeeds
  }
}

export function subscribeToReports(callback: () => void): () => void {
  const handleUpdate = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };

  window.addEventListener("reports-updated", handleUpdate);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("reports-updated", handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

export function formatReportTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatReportDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function getStarDisplay(stars: number): string {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}
