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

  // server full message (global limit)
  const [serverFullMsg, setServerFullMsg] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  // auto-scroll when open + new messages
  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  // connect only when the widget is opened (saves resources)
  useEffect(() => {
    if (!open) return;

    // reset UI state when opening
    setServerFullMsg("");
    setUsers([]);
    setConnected(false);

    const socket = io(SOCKET_URL, {
      transports: ["polling","websocket"],
      withCredentials: false,
      // IMPORTANT: don't let socket.io auto-reconnect forever if server is "full"
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
    const onConnectedUser = (u: User) =>
    setUsers((prev) => {
      if (!u?.id) return prev;
      return prev.some((x) => x.id === u.id) ? prev : [...prev, u];
    });

    const onDisconnectedUser = (id: string) =>
      setUsers((prev) => prev.filter((x) => x.id !== id));

    const onRoomFull = (payload: RoomFullPayload) => {
      const msg = payload?.message || "Server is full. Try again later.";
      setServerFullMsg(msg);
      setConnected(false);

      // close socket cleanly (server already disconnects, but we handle UI)
      try {
        socket.removeAllListeners();
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };

    const onMessage = (m: ChatMessage) => {
      setMessages((prev) => [...prev, m]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("users", onUsers);
    // This event name matches your controller (server-full / max users)
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
  }, [open, username]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = message.trim();
    if (!text || !connected || !socketRef.current) return;

    socketRef.current.emit("send", text);
    setMessage("");
  };

  const bg = darkMode ? "#0b1220" : "#ffffff";
  const border = darkMode ? "1px solid #334155" : "1px solid #e2e8f0";
  const sub = darkMode ? "#94a3b8" : "#475569";
  const textColor = darkMode ? "#f8fafc" : "#0f172a";

  const bubbleBg = darkMode ? "#1e293b" : "#86e07f";
  const bubbleShadow = darkMode
    ? "0 10px 30px rgba(0,0,0,0.35)"
    : "0 10px 30px rgba(15,23,42,0.18)";

  return (
    <>
      {/* Floating Circle Button */}
     <button
  onClick={() => setOpen((v) => !v)}
  title="Online Chat"
  style={{
    position: "fixed",
    right: 22 + 60 + 12, // ✅ left of video
    bottom: 22,
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
        💬
      </button>

      {/* Popup Window */}
      {open && (
        <div
          style={{
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
          }}
        >
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
            <div>
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
                padding: 6,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", flex: 1, minHeight: 0 }}>
            {/* Messages (scroll) */}
            <div
              style={{
                padding: 12,
                overflowY: "auto",
                minHeight: 0,
                borderRight: border,
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
                    <div style={{ maxWidth: "85%" }}>
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

            {/* Users (scroll) */}
            <div style={{ padding: 12, overflowY: "auto", minHeight: 0 }}>
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
                    }}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={send} style={{ padding: 12, borderTop: border, display: "flex", gap: 8 }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                serverFullMsg
                  ? "Server full…"
                  : connected
                  ? "Type a message…"
                  : "Connecting…"
              }
              disabled={!connected || !!serverFullMsg}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border,
                background: darkMode ? "#020617" : "#ffffff",
                color: textColor,
                outline: "none",
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
