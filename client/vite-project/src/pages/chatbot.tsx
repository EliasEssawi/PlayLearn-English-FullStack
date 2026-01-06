import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

type Msg = {
  role: "user" | "bot";
  text: string;
  time: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I’m your Gemini assistant. Ask me anything about the app or React.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const now = new Date().toLocaleTimeString();

    setMessages((prev) => [...prev, { role: "user", text, time: now }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chatbot", { message: text });
      const reply = String(data?.reply ?? "").trim() || "No reply.";
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply, time: new Date().toLocaleTimeString() },
      ]);
    } catch (err) {
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
    <div style={{ maxWidth: 950, margin: "0 auto", padding: 20 }}>
      <h2 style={{ margin: 0 }}>Chatbot</h2>
      <p style={{ marginTop: 6, color: "#666" }}>
        Talk to the Gemini assistant. Press <b>Enter</b> to send, <b>Shift+Enter</b> for new line.
      </p>

      <div
        style={{
          marginTop: 14,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          background: "#fff",
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
                    border: "1px solid #eee",
                    background: isUser ? "#f3f4f6" : "#ffffff",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.4,
                  }}
                >
                  {m.text}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
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

        {loading && <div style={{ color: "#666" }}>Bot is typing…</div>}
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
            border: "1px solid #e5e7eb",
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
              border: "1px solid #e5e7eb",
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
