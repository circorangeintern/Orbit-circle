import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/hooks/auth.hook";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export interface ChatMessage {
  id: number;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export function useChatSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("presence:online", ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    });
    socket.on("presence:offline", ({ userId }: { userId: string }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:join", conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:leave", conversationId);
  }, []);

  const sendMessage = useCallback((conversationId: string, body: string) => {
    console.log('🟡 socket.emit called with:', { conversationId, body });
    socketRef.current?.emit("message:send", { conversationId, body });
  }, []);

  const onNewMessage = useCallback((handler: (message: ChatMessage) => void) => {
    socketRef.current?.on("message:new", handler);
    return () => {
      socketRef.current?.off("message:new", handler);
    };
  }, []);

  const isOnline = useCallback((userId: string | null | undefined) => {
    if (!userId) return false;
    return onlineUserIds.has(userId);
  }, [onlineUserIds]);

  return { connected, joinConversation, leaveConversation, sendMessage, onNewMessage, isOnline };
}