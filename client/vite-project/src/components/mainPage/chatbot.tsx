import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

type Msg = {
  role: "user" | "bot";
  text: string;
  time: string;
};

type ChatbotProps = {
  darkMode: boolean;
};

export default function ChatbotPage({ darkMode }: ChatbotProps) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I’m your Gemini assistant. Ask me anything, or just say hello! 😊",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [
      ...prev,
      { role: "user", text, time: new Date().toLocaleTimeString() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
  `${API_BASE}/chatbot`,
  { message: text },
  { withCredentials: true }
);

      const reply = String(data?.reply ?? "").trim() || "No reply.";
      setMessages(prev => [
        ...prev,
        { role: "bot", text: reply, time: new Date().toLocaleTimeString() },
      ]);
    } catch {
      setMessages(prev => [
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
      style={{
        maxWidth: 950,
        margin: "0 auto",
        padding: 20,
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      <h2>Chatbot</h2>
      <p style={{ color: darkMode ? "#d1d5db" : "#6b7280" }}>
        Talk to the Gemini assistant. Press <b>Enter</b> to send, <b>Shift+Enter</b> for new line.
      </p>

      {/* CHAT BOX */}
      <div
        style={{
          marginTop: 14,
          border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
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
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
                    background: isUser
                      ? darkMode
                        ? "#1e293b"
                        : "#f3f4f6"
                      : darkMode
                      ? "#020617"
                      : "#ffffff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: darkMode ? "#9ca3af" : "#888",
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
          <div style={{ color: darkMode ? "#d1d5db" : "#666" }}>
            Bot is typing…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
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
            border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
            background: darkMode ? "#020617" : "#ffffff",
            color: darkMode ? "#f8fafc" : "#0f172a",
            resize: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: darkMode ? "1px solid #334155" : "1px solid #e5e7eb",
              background: darkMode ? "#1e293b" : "#ffffff",
              color: darkMode ? "#f8fafc" : "#0f172a",
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
