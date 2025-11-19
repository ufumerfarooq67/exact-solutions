// src/hooks/useWebSocket.ts
"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { queryClient } from "../components/query-provider";
import { ITask } from "../types";
import { TASKS_QUERY_KEY } from "../constants";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect to your NestJS WebSocket at /events namespace
    const socket = io((process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000") + "/events", {
      path: "/socket.io",
      auth: {
        token: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebSocket (Socket.IO)", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection failed:", err.message);
    });

    // Listen to your backend events
    socket.on("taskCreated", (task: ITask) => {
      queryClient.setQueryData<ITask[]>(TASKS_QUERY_KEY, (old = []) => [task, ...old]);
    });

    socket.on("taskAssigned", (task: ITask) => {
      queryClient.setQueryData<ITask[]>(TASKS_QUERY_KEY, (old = []) => [task, ...old]);
    });

    socket.on("taskUpdated", (updatedTask: ITask) => {
      queryClient.setQueryData<ITask[]>(TASKS_QUERY_KEY, (old = []) => old.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    });

    socket.on("taskDeleted", (deletedTask: ITask) => {
      queryClient.setQueryData<ITask[]>(TASKS_QUERY_KEY, (old = []) => old.filter((t) => t.id !== deletedTask.id));
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
      console.log("WebSocket disconnected");
    };
  }, []);
}
