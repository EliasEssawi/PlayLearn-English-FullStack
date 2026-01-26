import React, { useEffect, useMemo, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

type OnlineChatWidgetProps = {
  darkMode: boolean;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

type User = { id: string; name: string };
type ChatMessage = { text: string; date: string; user?: User };
type RoomFullPayload = { message?: string };

export default function OnlineChatWidget({ darkMode }: OnlineChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const [serverFullMsg, setServerFullMsg] = useState<string>("");

  // ✅ unread badge
  const [unread, setUnread] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ avoid stale "open" inside socket callback
  const openRef = useRef(open);

  // ✅ responsive
  const [isMobile, setIsMobile] = useState(false);

  // Resolve username from localStorage
  const username = useMemo(() => {
    const raw = localStorage.getItem("activeProfile");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        const n = p?.email?.profileName;
        if (typeof n === "string" && n.trim()) return n.trim();
      } catch {}
    }
    return "Player";
  }, []);

  // keep ref updated + clear unread when opening
  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(0);
  }, [open]);

  // auto-scroll when open + new messages
  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  // ✅ detect mobile + handle dynamic viewport
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 560);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    // optional: prevent background scroll when open on mobile
    const prevOverflow = document.body.style.overflow;
    if (open && window.innerWidth <= 560) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // ✅ Connect ONCE on mount (so unread works even when closed)
  useEffect(() => {
    setServerFullMsg("");
    setUsers([]);
    setConnected(false);

    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 800,
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setServerFullMsg("");
      socket.emit("username", username);
    };

    const onDisconnect = () => setConnected(false);

    const onUsers = (u: User[]) => setUsers(Array.isArray(u) ? u : []);

    const onRoomFull = (payload: RoomFullPayload) => {
      const msg = payload?.message || "Server is full. Try again later.";
      setServerFullMsg(msg);
      setConnected(false);

      try {
        socket.removeAllListeners();
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };

    const onMessage = (m: ChatMessage) => {
      setMessages((prev) => [...prev, m]);
      if (!openRef.current) setUnread((u) => u + 1);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("users", onUsers);
    socket.on("room_full", onRoomFull);
    socket.on("message", onMessage);

    return () => {
      try {
        socket.removeAllListeners();
        socket.disconnect();
      } catch {}
      socketRef.current = null;
      setConnected(false);
      setUsers([]);
    };
  }, [username]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text || !connected || !socketRef.current) return;
    socketRef.current.emit("send", text);
    setMessage("");
  };

  // Theme-dependent colors
  const bg = darkMode ? "#0b1220" : "#ffffff";
  const border = darkMode ? "1px solid #334155" : "1px solid #e2e8f0";
  const sub = darkMode ? "#94a3b8" : "#475569";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";

  const bubbleBg = darkMode ? "#1e293b" : "#86e07f";
  const bubbleShadow = darkMode
    ? "0 10px 30px rgba(0,0,0,0.35)"
    : "0 10px 30px rgba(15,23,42,0.18)";

  // ✅ responsive sizing for popup
  const popupStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100dvh", // better than 100vh on mobile
        borderRadius: 0,
        background: bg,
        border: "none",
        boxShadow: "none",
        overflow: "hidden",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        right: 22,
        bottom: 95,
        width: 360,
        height: 480,
        borderRadius: 16,
        background: bg,
        border,
        boxShadow: bubbleShadow,
        overflow: "hidden",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      };

  return (
    <>
      {/* Floating Circle Button + unread badge */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Online Chat"
        style={{
          position: "fixed",
          right: isMobile ? 16 : 22 + 60 + 12, // on mobile keep it simpler
          bottom: 16,
          width: 60,
          height: 60,
          borderRadius: 999,
          border: "none",
          background: bubbleBg,
          color: darkMode ? "#f8fafc" : "#0f172a",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: bubbleShadow,
          zIndex: 999990,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ position: "relative" }}>
          💬
          {unread > 0 && (
            <span
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                minWidth: 18,
                height: 18,
                padding: "0 6px",
                borderRadius: 999,
                background: "#ef4444",
                color: "white",
                fontSize: 12,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "18px",
                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </button>

      {/* Popup Window */}
      {open && (
        <div style={popupStyle}>
          {/* Header */}
          <div
            style={{
              padding: "12px 12px",
              borderBottom: border,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ color: textColor, fontWeight: 800 }}>Online Chat</div>
              <div style={{ color: sub, fontSize: 12 }}>
                You: <b>{username}</b> •{" "}
                <b style={{ color: connected ? (darkMode ? "#86e07f" : "#16a34a") : sub }}>
                  {connected ? "Online" : "Offline"}
                </b>
              </div>

              {serverFullMsg && (
                <div style={{ color: darkMode ? "#fca5a5" : "#b91c1c", fontSize: 12, marginTop: 6 }}>
                  {serverFullMsg}
                </div>
              )}
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                color: sub,
                fontSize: 18,
                cursor: "pointer",
                padding: 10,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 120px",
              gridTemplateRows: isMobile ? "1fr auto" : undefined,
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Messages */}
            <div
              style={{
                padding: 12,
                overflowY: "auto",
                minHeight: 0,
                borderRight: isMobile ? "none" : border,
              }}
            >
              {messages.map((m, idx) => {
                const isMe = (m.user?.name || "") === username;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ maxWidth: isMobile ? "92%" : "85%" }}>
                      <div
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          background: isMe
                            ? darkMode
                              ? "#1e293b"
                              : "#86e07f"
                            : darkMode
                            ? "#0b1220"
                            : "#f1f5f9",
                          color: isMe && !darkMode ? "#0f172a" : textColor,
                          border,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 3 }}>
                          {m.user?.name || "Unknown"}
                        </div>
                        {m.text}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: sub,
                          marginTop: 3,
                          textAlign: isMe ? "right" : "left",
                        }}
                      >
                        {new Date(m.date).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Users */}
            <div
              style={{
                padding: 12,
                overflowY: "auto",
                minHeight: 0,
                borderTop: isMobile ? border : "none",
                maxHeight: isMobile ? 140 : undefined, // ✅ small drawer on mobile
              }}
            >
              <div style={{ color: sub, fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
                Users ({users.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      border,
                      color: textColor,
                      background: darkMode ? "#0b1220" : "#f8fafc",
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={send}
            style={{
              padding: 12,
              borderTop: border,
              display: "flex",
              gap: 8,
              paddingBottom: isMobile ? 16 : 12,
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={serverFullMsg ? "Server full…" : connected ? "Type a message…" : "Connecting…"}
              disabled={!connected || !!serverFullMsg}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border,
                background: darkMode ? "#020617" : "#ffffff",
                color: textColor,
                outline: "none",
                fontSize: isMobile ? 16 : 14, // ✅ prevent iOS zoom
              }}
            />
            <button
              type="submit"
              disabled={!connected || !!serverFullMsg || !message.trim()}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "none",
                background: darkMode ? "#1e293b" : "#86e07f",
                color: darkMode ? "#f8fafc" : "#0f172a",
                fontWeight: 800,
                cursor: !connected || !!serverFullMsg || !message.trim() ? "not-allowed" : "pointer",
                opacity: !connected || !!serverFullMsg || !message.trim() ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
