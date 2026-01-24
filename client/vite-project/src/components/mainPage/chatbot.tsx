import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

type Msg = {
  role: "user" | "bot";
  text: string;
  time: string;
};

type ChatBotProps = {
  darkMode: boolean;
};

function toServerMessages(msgs: Msg[]) {
  return msgs.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    text: m.text,
  }));
}

export default function ChatBot({ darkMode }: ChatBotProps) {
  // ✅ NEW session each refresh (in-memory only)
  const sessionIdRef = useRef<string>(
    crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  );

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I’m your English practice assistant 😊\nNote: If you refresh this page, the chat will reset.",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const now = new Date().toLocaleTimeString();
    const nextLocal: Msg[] = [...messages, { role: "user", text, time: now }];

    setMessages(nextLocal);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chatbot", {
        message: text,
        sessionId: sessionIdRef.current, // ✅ refresh -> new id -> memory cleared
        messages: toServerMessages(nextLocal),
      });

      const reply = String(data?.reply ?? "").trim() || "No reply.";

      if (Array.isArray(data?.messages)) {
        const serverMsgs = data.messages as { role: "user" | "assistant"; text: string }[];
        const rebuilt: Msg[] = serverMsgs.map((m) => ({
          role: m.role === "user" ? "user" : "bot",
          text: m.text,
          time: new Date().toLocaleTimeString(),
        }));
        setMessages(rebuilt);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: reply, time: new Date().toLocaleTimeString() },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, the server failed. Please try again.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div
      className="transition-colors duration-300"
      style={{
        maxWidth: 950,
        margin: "0 auto",
        padding: 20,
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      <h2 className="text-2xl font-bold mb-2">Chatbot</h2>
      <p style={{ color: darkMode ? "#94a3b8" : "#475569" }}>
        Talk to the English practice assistant. Press <b>Enter</b> to send,{" "}
        <b>Shift+Enter</b> for new line.{" "}
        <span style={{ opacity: 0.8 }}>
          (Refreshing this page clears memory.)
        </span>
      </p>

      <div
        className="transition-all duration-300"
        style={{
          marginTop: 14,
          border: darkMode ? "2px solid #334155" : "2px solid #6bc465",
          borderRadius: 14,
          background: darkMode ? "#020617" : "#ffffff",
          height: 460,
          overflowY: "auto",
          padding: 14,
        }}
      >
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div style={{ maxWidth: "75%" }}>
                <div
                  className="transition-all duration-300"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: isUser
                      ? darkMode
                        ? "#1e293b"
                        : "#86e07f"
                      : darkMode
                      ? "#020617"
                      : "#f1f5f9",
                    color: isUser && !darkMode ? "#0f172a" : "inherit",
                    border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                    boxShadow: !darkMode && isUser ? "0 4px 0 #58a352" : "none",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: darkMode ? "#9ca3af" : "#64748b",
                    marginTop: 4,
                    textAlign: isUser ? "right" : "left",
                  }}
                >
                  {isUser ? "You" : "Bot"} • {m.time}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ color: darkMode ? "#94a3b8" : "#64748b", fontStyle: "italic" }}>
            Bot is typing…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message…"
          rows={3}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: darkMode ? "2px solid #334155" : "2px solid #6bc465",
            background: darkMode ? "#020617" : "#ffffff",
            color: darkMode ? "#f8fafc" : "#0f172a",
            resize: "none",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            className="font-bold transition-all active:translate-y-1"
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: darkMode ? "#1e293b" : "#86e07f",
              color: darkMode ? "#f8fafc" : "#0f172a",
              boxShadow: darkMode ? "0 4px 0 #0f172a" : "0 4px 0 #58a352",
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              opacity: !input.trim() || loading ? 0.6 : 1,
            }}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
