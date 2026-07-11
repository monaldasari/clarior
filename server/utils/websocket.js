import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_123";

let wss;
const clients = new Map(); // userId -> Set of WS connections

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
      const token = url.searchParams.get("token");

      if (!token) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.userId = decoded.id;
        wss.emit("connection", ws, request);
      });
    } catch (err) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (ws) => {
    const userId = ws.userId;
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }
    clients.get(userId).add(ws);

    ws.on("close", () => {
      const userConnections = clients.get(userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          clients.delete(userId);
        }
      }
    });

    ws.on("error", (err) => {
      console.error(`WebSocket error for user ID ${userId}:`, err);
    });
  });
};

export const sendRealtimeNotification = (userId, notification) => {
  if (!clients.has(userId)) return;
  const userConnections = clients.get(userId);
  const message = JSON.stringify({ type: "notification", data: notification });
  
  for (const ws of userConnections) {
    if (ws.readyState === 1) { // OPEN
      ws.send(message);
    }
  }
};
