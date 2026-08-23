"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BIDDING_SOCKET_PATH, GATEWAY_URL } from "@/config/clientConfig";

/**
 * Socket.IO client for the auction room. Connects through the api-gateway so
 * the JWT cookie is exchanged for X-User-Id/X-User-Role headers server-side.
 */
export default function useAuctionSocket() {
  const socketRef = useRef(null);
  const joinedRoomRef = useRef(null);
  const monitorJoinedRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState("");

  const ensureSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;
    const socket = io(GATEWAY_URL, {
      path: BIDDING_SOCKET_PATH,
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1500,
    });

    socket.on("connect", () => {
      setConnected(true);
      setSocketError("");
      if (joinedRoomRef.current) {
        socket.emit("joinAuction", { auctionId: joinedRoomRef.current });
      }
      if (monitorJoinedRef.current) {
        socket.emit("joinMonitor");
      }
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (error) => {
      setSocketError(error?.message || "Khong the ket noi may chu dau gia.");
    });

    socketRef.current = socket;
    return socket;
  }, []);

  const connect = useCallback(() => {
    ensureSocket().connect();
  }, [ensureSocket]);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (joinedRoomRef.current) {
      socket.emit("leaveAuction", { auctionId: joinedRoomRef.current });
    }
    joinedRoomRef.current = null;
    monitorJoinedRef.current = false;
    socket.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  const joinAuction = useCallback(
    (auctionId) =>
      new Promise((resolve, reject) => {
        const socket = ensureSocket();
        joinedRoomRef.current = auctionId;
        if (!socket.connected) socket.connect();
        const onException = (error) => {
          socket.off("exception", onException);
          reject(new Error(error?.message || "Khong the vao phong dau gia."));
        };
        socket.on("exception", onException);
        socket.emit("joinAuction", { auctionId }, (response) => {
          socket.off("exception", onException);
          resolve(response?.data ?? response);
        });
      }),
    [ensureSocket],
  );

  const placeBid = useCallback((auctionId, bidAmount, idempotencyKey) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        reject(new Error("SOCKET_DISCONNECTED"));
        return;
      }
      socket.emit("placeBid", { auctionId, bidAmount, idempotencyKey }, (response) => {
        resolve(response?.data ?? response);
      });
    });
  }, []);

  const joinMonitor = useCallback(
    () =>
      new Promise((resolve, reject) => {
        const socket = ensureSocket();
        monitorJoinedRef.current = true;
        if (!socket.connected) socket.connect();
        const onException = (error) => {
          socket.off("exception", onException);
          reject(new Error(error?.message || "Khong vao duoc phong giam sat."));
        };
        socket.on("exception", onException);
        socket.emit("joinMonitor", (response) => {
          socket.off("exception", onException);
          resolve(response?.data ?? response);
        });
      }),
    [ensureSocket],
  );

  const on = useCallback(
    (eventName, handler) => {
      const socket = ensureSocket();
      socket.on(eventName, handler);
      return () => socket.off(eventName, handler);
    },
    [ensureSocket],
  );

  useEffect(
    () => () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    },
    [],
  );

  return { connect, disconnect, joinAuction, joinMonitor, placeBid, on, connected, socketError };
}
