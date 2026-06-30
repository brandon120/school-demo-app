import { io, type Socket } from "socket.io-client";
import type { StudentReport } from "./reports";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function joinTeacherRoom(): void {
  getSocket().emit("join-teacher");
}

export function onNewReport(callback: (report: StudentReport) => void): () => void {
  const s = getSocket();
  s.on("report:new", callback);
  return () => s.off("report:new", callback);
}

export function onReportsCleared(callback: () => void): () => void {
  const s = getSocket();
  s.on("reports:cleared", callback);
  return () => s.off("reports:cleared", callback);
}

export function onSocketStatus(callback: (connected: boolean) => void): () => void {
  const s = getSocket();
  const onConnect = () => callback(true);
  const onDisconnect = () => callback(false);
  s.on("connect", onConnect);
  s.on("disconnect", onDisconnect);
  callback(s.connected);
  return () => {
    s.off("connect", onConnect);
    s.off("disconnect", onDisconnect);
  };
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
